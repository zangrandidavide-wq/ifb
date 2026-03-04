// navbar.js
document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.getElementById("navbar-placeholder");
    
    const navbarHTML = `
    <nav class="fixed w-full z-50 top-0 start-0 border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3">
            <a class="flex items-center space-x-2" href="index.html">
                <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    <span class="material-icons">sports_volleyball</span>
                </div>
                <span class="self-center text-xl font-bold text-primary dark:text-white">I Follow Beach Volley</span>
            </a>
            <div class="flex md:order-2 space-x-3 md:space-x-4 items-center">
                <a href="members.html" class="text-primary hover:text-white bg-white hover:bg-primary border border-primary font-medium rounded-full text-sm px-5 py-2.5 transition-all">Area Membri</a>
                <button data-collapse-toggle="navbar-sticky" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 17 14"><path d="M1 1h15M1 7h15M1 13h15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                </button>
            </div>
            <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                <ul class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                    <li><a href="index.html" class="block py-2 px-3 text-primary">Home</a></li>
                    <li><a href="eventi.html" class="block py-2 px-3 text-gray-900 hover:text-primary">Clinic</a></li>
                    <li><a href="eventi.html" class="block py-2 px-3 text-gray-900 hover:text-primary">Eventi</a></li>
                    <li><a href="contatti.html" class="block py-2 px-3 text-gray-900 hover:text-primary">Contatti</a></li>
                </ul>
            </div>
        </div>
    </nav>`;

    if (navContainer) {
        navContainer.innerHTML = navbarHTML;
    }
});
