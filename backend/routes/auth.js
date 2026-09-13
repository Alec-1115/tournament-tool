const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/user');

const DISCORD_API = 'https://discord.com/api/v10';

// Start Discord OAuth2 login
router.get('/discord', (req, res) => {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_REDIRECT_URI) {
    return res.status(500).json({
      error: 'Discord OAuth is not configured on the server.'
    });
  }

  const state = crypto.randomBytes(32).toString('hex');

  req.session.discordOAuthState = state;

  req.session.save(err => {
    if (err) {
      console.error('OAuth session save failed:', err);

      return res.status(500).json({
        error: 'Failed to start Discord authentication.'
      });
    }

    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
      state
    });

    res.redirect(
      `${DISCORD_API}/oauth2/authorize?${params.toString()}`
    );
  });
});

// Discord OAuth2 callback
router.get('/discord/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/index.html?error=discord_denied`
      );
    }

    if (
      !code ||
      !state ||
      !req.session.discordOAuthState ||
      state !== req.session.discordOAuthState
    ) {
      return res.status(400).json({
        error: 'Invalid OAuth state or authorization code.'
      });
    }

    delete req.session.discordOAuthState;

    const tokenResponse = await fetch(
      `${DISCORD_API}/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.DISCORD_REDIRECT_URI
        })
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        'Discord token exchange failed:',
        await tokenResponse.text()
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/index.html?error=discord_auth_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch(
      `${DISCORD_API}/users/@me`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    if (!userResponse.ok) {
      console.error(
        'Discord user lookup failed:',
        await userResponse.text()
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/index.html?error=discord_user_failed`
      );
    }

    const discordUser = await userResponse.json();

    let user = await User.findOne({
      discordId: discordUser.id
    });

    if (!user) {
      user = new User({
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || null,
        avatar: discordUser.avatar || null
      });
    } else {
      user.username = discordUser.username;
      user.globalName = discordUser.global_name || null;
      user.avatar = discordUser.avatar || null;
    }

    await user.save();

    req.session.userId = user._id.toString();
    req.session.discordId = user.discordId;

    req.session.save(err => {
      if (err) {
        console.error('Session save failed:', err);

        return res.status(500).json({
          error: 'Failed to create login session.'
        });
      }

      res.redirect(
        `${process.env.FRONTEND_URL}/dashboard.html`
      );
    });

  } catch (err) {
    console.error('Discord authentication error:', err);

    res.redirect(
      `${process.env.FRONTEND_URL}/index.html?error=server_error`
    );
  }
});

// Get currently authenticated user
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        authenticated: false
      });
    }

    const user = await User.findById(
      req.session.userId
    ).select('-__v');

    if (!user) {
      req.session.destroy(() => {});

      return res.status(401).json({
        authenticated: false
      });
    }

    res.json({
      authenticated: true,
      user
    });

  } catch (err) {
    console.error('Auth check error:', err);

    res.status(500).json({
      error: 'Failed to check authentication.'
    });
  }
});

// Log out
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        error: 'Failed to log out.'
      });
    }

    res.clearCookie('tournament.sid');

    res.json({
      message: 'Logged out successfully'
    });
  });
});

module.exports = router;