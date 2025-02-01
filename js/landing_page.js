function toggleNavbar() {
    const navbar = document.querySelector('.navbar');
    const brand = document.getElementById("website-brand");
    
    navbar.classList.toggle('active');

    if (brand.style.display === 'none') 
    {
          brand.style.display = "block";
    }
        else 
    {
          brand.style.display = "none"
    }

}





const mouseScroll = document.querySelector('.mouse_scroll');
const pageHeight = document.documentElement.scrollHeight;
const backtotop = document.getElementById('backtotop_click');

window.addEventListener('scroll', () => {
    if(window.scrollY >  (pageHeight - 1000)){
        mouseScroll.style.display = 'none';
        if(mouseScroll.style.display = 'none'){
            backtotop.style.display = 'block'
        }else{
            backtotop.style.display = 'none'
        }
    }
});


window.addEventListener('scroll', () => {
    if(window.scrollY < 2000){
        backtotop.style.display = 'none';
    }
});