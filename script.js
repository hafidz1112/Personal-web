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
    document.querySelectorAll("#btn-skills, #btn-pengalaman, #btn-sertificate")
      .forEach(btn => {
        btn.classList.remove("text-black", "border-black");
        btn.classList.add("text-gray-600", "border-transparent");
      });

    // aktifkan tombol sesuai tab
    document.getElementById("btn-" + tab).classList.remove("text-gray-600", "border-transparent");
    document.getElementById("btn-" + tab).classList.add("text-black", "border-black");
    document.getElementById("btn-" + tab).classList.add("text-black", "border-black");
  }

  // default buka Skills
  showTab("skills");

  // bikin global biar bisa dipanggil dari onclick di HTML
  window.showTab = showTab;

  // load skills.json
  fetch("skills.json")
    .then(response => {
      if (!response.ok) throw new Error("Gagal load skills.json");
      return response.json();
    })
    .then(data => {
      const container = document.getElementById("skills-container");

      data.forEach(skill => {
        const card = document.createElement("div");
        card.className = "bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 flex flex-col items-center";

        card.innerHTML = `
          <img src="${skill.icon}" alt="${skill.name}" class="w-14 h-14 object-contain mb-3">
          <p class="text-sm font-medium text-gray-700">${skill.name}</p>
        `;

        container.appendChild(card);
      });
    })
    .catch(error => console.error("Error loading skills:", error));

  // ==============================
  // ANIMASI SCROLL SEKALI
  // ==============================
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate__animated", "animate__fadeInUp");
        observer.unobserve(entry.target); // hanya sekali
      }
    });
  }, { threshold: 0.2 });

  animatedElements.forEach(el => observer.observe(el));
  
  const pdfFiles = [
    { url: "assets/MTCNA.pdf", title: "Mikrotik MTCNA", year: "2023" },
    { url: "assets/certificateHTML.pdf", title: "Sertifikat HTML dasar Codepolitan", year: "2024" },
    { url: "assets/Certificate Javascript OOP - CODEPOLITAN.pdf", title: "Certificate Javascript OOP - CODEPOLITAN", year: "2024" },
    { url: "assets/Certificate AjaX dan API - CODEPOLITAN.pdf", title: "Certificate AjaX dan API - CODEPOLITAN", year: "2024" },
    { url: "assets/Certificate MogoDB- CODEPOLITAN.pdf", title: "Certificate MogoDB- CODEPOLITAN", year: "2024" },
    { url: "assets/Certificate Studi Kasus - CODEPOLITAN.pdf", title: "Certificate Studi Kasus - CODEPOLITAN", year: "2024" },
    { url: "assets/Hack Point-Muhammad_Hafidz.pdf", title: "Hack Point-Muhammad_Hafidz", year: "2024" },
  ];

  const container = document.getElementById("pdf-grid");

  pdfFiles.forEach((file) => {
    const card = document.createElement("div");
    card.className = "bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-md transition";

    // Canvas buat thumbnail PDF
    const canvas = document.createElement("canvas");
    canvas.className = "mx-auto"; // supaya thumbnail di tengah

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "h-48 flex items-center justify-center bg-gray-50"; 
    canvasWrapper.appendChild(canvas);

    const link = document.createElement("a");
    link.href = file.url;
    link.target = "_blank";
    link.className = "block"; 
    link.appendChild(canvasWrapper);

    const textDiv = document.createElement("div");
    textDiv.className = "p-4";
    textDiv.innerHTML = `
      <p class="font-semibold text-gray-800">${file.title}</p>
      <p class="text-gray-600 text-sm">${file.year}</p>
    `;

    card.appendChild(link);
    card.appendChild(textDiv);
    container.appendChild(card);

    // Render PDF ke thumbnail (halaman pertama)
    const loadingTask = pdfjsLib.getDocument(file.url);
    loadingTask.promise.then(pdf => {
      pdf.getPage(1).then(page => {
        const viewport = page.getViewport({ scale: 0.3 }); // thumbnail kecil
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
          canvasContext: context,
          viewport: viewport
        });
      });
    });
  });
});
