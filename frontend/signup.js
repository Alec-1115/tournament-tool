const form=document.getElementById("signupForm");

const username=document.getElementById("username");
const email=document.getElementById("email");
const password=document.getElementById("password");
const confirmPassword=document.getElementById("confirmPassword");

const usernameError=document.getElementById("usernameError");
const emailError=document.getElementById("emailError");
const confirmError=document.getElementById("confirmError");
const message=document.getElementById("message");

const strength=document.querySelector(".strength");
const strengthText=document.getElementById("strengthText");

function validateEmail(){
    const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

    email.classList.toggle("valid",valid);
    email.classList.toggle("invalid",!valid);

    emailError.textContent=
        email.value&&!valid
        ?"Please enter a valid email address."
        :"";

    return valid;
}

function passwordStrength(){
    const value=password.value;

    let score=0;

    if(value.length>=8)score++;
    if(/[A-Z]/.test(value))score++;
    if(/[a-z]/.test(value))score++;
    if(/[0-9]/.test(value))score++;
    if(/[^A-Za-z0-9]/.test(value))score++;

    strength.className="strength";

    if(!value){
        strengthText.textContent="";
        return false;
    }

    if(score<=2){
        strength.classList.add("weak");
        strengthText.textContent="Weak";
    }else if(score<=4){
        strength.classList.add("medium");
        strengthText.textContent="Medium";
    }else{
        strength.classList.add("strong");
        strengthText.textContent="Strong";
    }

    return score===5;
}

function validateConfirm(){
    const valid=
        confirmPassword.value.length>0&&
        confirmPassword.value===password.value;

    confirmPassword.classList.toggle("valid",valid);
    confirmPassword.classList.toggle("invalid",!valid);

    confirmError.textContent=
        confirmPassword.value&&!valid
        ?"Passwords do not match."
        :"";

    return valid;
}

function validateUsername(){
    const valid=username.value.trim().length>0;

    username.classList.toggle("valid",valid);
    username.classList.toggle("invalid",!valid);

    usernameError.textContent=
        username.value&&!valid
        ?"Please enter a username."
        :"";

    return valid;
}

username.addEventListener("input",validateUsername);
email.addEventListener("input",validateEmail);
password.addEventListener("input",passwordStrength);
password.addEventListener("input",validateConfirm);
confirmPassword.addEventListener("input",validateConfirm);

form.addEventListener("submit",e=>{
    e.preventDefault();

    message.textContent="";

    const usernameValid=validateUsername();
    const emailValid=validateEmail();
    const passwordValid=passwordStrength();
    const confirmValid=validateConfirm();

    if(!usernameValid||!emailValid||!passwordValid||!confirmValid){
        message.textContent="Please fix the errors above.";
        return;
    }

    message.textContent=
        "Account creation will be connected to the backend next.";
});