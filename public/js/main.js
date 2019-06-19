const dropdown = document.querySelector(".dropdown");

dropdown.addEventListener('click', () => {
    const menu = document.querySelector(".dropdown-menu");
    if(menu){
      menu.classList.toggle("closed");
    }

});
