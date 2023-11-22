const coll = document.getElementsByClassName("collapsible");

function init(){
    var i;
    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            
            if (this.classList.contains('active')){
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = '0';
            } 
        });
    }
    
    window.addEventListener("resize", function(){
        for (i = 0; i < coll.length; i++) {
            var content = coll[i].nextElementSibling;
            if (coll[i].classList.contains('active')){
              content.style.maxHeight = content.scrollHeight + "px";
            } else {
              content.style.maxHeight = '0';
            } 
        }
    });
}

init();
