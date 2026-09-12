const cards=document.querySelectorAll(".card");
let current=0;

function update(index){
    current=(index+cards.length)%cards.length;

    cards.forEach((card,i)=>{
        let position=i-current;

        if(position>cards.length/2)position-=cards.length;
        if(position<-cards.length/2)position+=cards.length;

        card.className="card";

        if(position===0)card.classList.add("center");
        else if(position===-1)card.classList.add("up-1");
        else if(position===1)card.classList.add("down-1");
        else if(position===-2)card.classList.add("up-2");
        else if(position===2)card.classList.add("down-2");
        else card.classList.add("hidden");
    });
}

update(0);
setInterval(()=>update(current+1),4000);