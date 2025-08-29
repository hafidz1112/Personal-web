const btn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");

    btn.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });
    function showTab(tab) {
    // sembunyikan semua
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    // tampilkan yang dipilih
    document.getElementById(tab).classList.remove("hidden");

    // reset style button
    document.querySelectorAll("button").forEach(btn => btn.classList.remove("text-black","border-yellow-400"));
    // aktifkan button terpilih
    document.getElementById("btn-" + tab).classList.add("text-black","border-yellow-400");
    }

  // default tampil Skills
    showTab('skills');