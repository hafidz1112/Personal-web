document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  // toggle menu navbar atas
  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // fungsi filter bawah
  function showTab(tab) {
    // sembunyikan semua tab
    document.querySelectorAll(".tab-content")
      .forEach(el => el.classList.add("hidden"));

    // tampilkan tab terpilih
    document.getElementById(tab).classList.remove("hidden");

    // reset style semua tombol navbar filter
    document.querySelectorAll("#btn-skills, #btn-pengalaman")
      .forEach(btn => {
        btn.classList.remove("text-black", "border-black");
        btn.classList.add("text-gray-600", "border-transparent");
      });

    // aktifkan tombol sesuai tab
    document.getElementById("btn-" + tab).classList.remove("text-gray-600", "border-transparent");
    document.getElementById("btn-" + tab).classList.add("text-black", "border-black");
  }

  // default buka Skills
  showTab("skills");

  // bikin global biar bisa dipanggil dari onclick di HTML
  window.showTab = showTab;
});