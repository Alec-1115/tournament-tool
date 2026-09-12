const cards=document.querySelectorAll(".card");
let current=0;

function update(i){
 current=(i+cards.length)%cards.length;

 cards.forEach((card,n)=>{
  let o=n-current;

  if(o>cards.length/2)o-=cards.length;
  if(o<-cards.length/2)o+=cards.length;

  card.className="card";

  if(o===0)card.classList.add("center");
  else if(o===-1)card.classList.add("up-1");
  else if(o===1)card.classList.add("down-1");
  else if(o===-2)card.classList.add("up-2");
  else if(o===2)card.classList.add("down-2");
  else card.classList.add("hidden");
 });
}

update(0);
setInterval(()=>update(current+1),4000);