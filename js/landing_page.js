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

window.addEventListener('scroll', () => {
    if(window.scrollY >  (pageHeight - 1000)){
        mouseScroll.style.display = 'none';
    }else{
        mouseScroll.style.display = 'block'
    }
});