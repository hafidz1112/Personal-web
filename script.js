document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  // toggle menu navbar atas
  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // Setup Intersection Observer untuk animasi scroll
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate__animated", "animate__fadeInUp");
        entry.target.classList.remove("opacity-0"); // Pastikan opacity terbuka saat terdeteksi
        observer.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => observer.observe(el));

  // fungsi filter bawah
  function showTab(tab) {
    // sembunyikan semua tab
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));

    // tampilkan tab terpilih
    const activeTab = document.getElementById(tab);
    if (activeTab) {
      activeTab.classList.remove("hidden");
      
      // TRICK UNTUK MOBILE: Picu ulang animasi elemen di dalam tab yang baru dibuka
      const cardsInTab = activeTab.querySelectorAll(".animate-on-scroll, .opacity-0");
      cardsInTab.forEach(card => {
        card.classList.add("animate__animated", "animate__fadeInUp");
        card.classList.remove("opacity-0");
      });
    }

    // reset style semua tombol navbar filter
    document.querySelectorAll("#btn-skills, #btn-pengalaman, #btn-sertificate")
      .forEach(btn => {
        btn.classList.remove("text-black", "border-black");
        btn.classList.add("text-gray-600", "border-transparent");
      });

    // aktifkan tombol sesuai tab
    const targetBtn = document.getElementById("btn-" + tab);
    if (targetBtn) {
      targetBtn.classList.remove("text-gray-600", "border-transparent");
      targetBtn.classList.add("text-black", "border-black");
    }
  }

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
      if (!container) return;

      data.forEach(skill => {
        const card = document.createElement("div");
        card.className = "bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 flex flex-col items-center";

        card.innerHTML = `
          <img src="${skill.icon}" alt="${skill.name}" class="w-14 h-14 object-contain mb-3">
          <p class="text-sm font-medium text-gray-700">${skill.name}</p>
        `;
        container.appendChild(card);
      });

      // Default buka Skills setelah fetch data selesai
      showTab("skills");
    })
    .catch(error => {
      console.error("Error loading skills:", error);
      showTab("skills"); // Fallback jika fetch gagal
    });
  
  // Array Data PDF (Sudah diperbaiki dari double koma ',,')
  const pdfFiles = [
    { url: "assets/pdf/sertifikat MTCNA.pdf", title: "Mikrotik MTCNA", year: "2025" },
    { url: "assets/pdf/certificateHTML.pdf", title: "Sertifikat HTML dasar Codepolitan", year: "2024" },
    { url: "assets/pdf/Certificate Javascript OOP - CODEPOLITAN.pdf", title: "Certificate Javascript OOP - CODEPOLITAN", year: "2024" },
    { url: "assets/pdf/Certificate AjaX dan API - CODEPOLITAN.pdf", title: "Certificate AjaX dan API - CODEPOLITAN", year: "2024" },
    { url: "assets/pdf/Certificate MogoDB- CODEPOLITAN.pdf", title: "Certificate MogoDB- CODEPOLITAN", year: "2024" },
    { url: "assets/pdf/Certificate Studi Kasus - CODEPOLITAN.pdf", title: "Certificate Studi Kasus - CODEPOLITAN", year: "2024" },
    { url: "assets/pdf/Belajar Back-End Pemula dengan JavaScript.pdf", title: "Belajar Back-End Pemula dengan JavaScript", year: "2026" },
    { url: "assets/pdf/Belajar Fundamental Back-End dengan JavaScript.pdf", title: "Belajar Fundamental Back-End dengan JavaScript", year: "2026" },
    { url: "assets/pdf/Belajar Membuat Aplikasi Web dengan React.pdf", title: "Belajar Membuat Aplikasi Web dengan React", year: "2026" },
    { url: "assets/pdf/Belajar Fundamental Aplikasi Web dengan React.pdf", title: "Belajar Fundamental Aplikasi Web dengan React", year: "2024" },
    { url: "assets/pdf/Belajar Dasar Pemrograman JavaScript.pdf", title: "Belajar Dasar Pemrograman JavaScript", year: "2026" },
    { url: "assets/pdf/Belajar Membuat Front-End Web untuk Pemula.pdf", title: "Belajar Membuat Front-End Web untuk Pemula", year: "2026" },
    { url: "assets/pdf/Belajar Dasar Pemrograman Web.pdf", title: "Belajar Dasar Pemrograman Web", year: "2026" },
    { url: "assets/pdf/AWS.pdf", title: "Belajar Dasar Cloud dan Gen AI di AWS", year: "2024" },
    { url: "assets/pdf/Pengenalan ke Logika Pemrograman.pdf", title: "Pengenalan ke Logika Pemrograman", year: "2026" },
    { url: "assets/pdf/Memulai Dasar Pemrograman.pdf", title: "Memulai Dasar Pemrograman untuk Menjadi Pengembang Software", year: "2026" },
    { url: "assets/pdf/Hack Point-Muhammad_Hafidz.pdf", title: "Hack Point-Muhammad_Hafidz", year: "2024" }
  ];

  const container = document.getElementById("pdf-grid");

  if (container) {
    pdfFiles.forEach((file) => {
      // 1. Buat Card Utama dengan layout Flexbox vertikal yang solid
      const card = document.createElement("div");
      card.className = "flex flex-col bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100 animate-on-scroll opacity-0 h-full";

      // 2. Canvas buat thumbnail PDF
      const canvas = document.createElement("canvas");
      // max-w-full dan max-h-full memastikan gambar PDF tidak meluber keluar box
      canvas.className = "mx-auto max-w-full max-h-full object-contain"; 

      // 3. Wrapper area preview atas (tetap abu-abu terang sebagai ruang gambar)
      const canvasWrapper = document.createElement("div");
      canvasWrapper.className = "h-48 w-full flex items-center justify-center bg-gray-50 overflow-hidden p-2 border-b border-gray-100 relative z-0"; 
      canvasWrapper.appendChild(canvas);

      const link = document.createElement("a");
      link.href = file.url;
      link.target = "_blank";
      link.className = "block w-full hover:opacity-90 transition"; 
      link.appendChild(canvasWrapper);

      // 4. Pembungkus Teks Bawah (Diberi bg-white solid dan flex-grow agar tingginya seragam)
      const textDiv = document.createElement("div");
      textDiv.className = "p-4 bg-white flex flex-col justify-between flex-grow relative z-10 text-left";
      textDiv.innerHTML = `
        <p class="font-bold text-gray-800 text-[15px] line-clamp-2 mb-2" title="${file.title}">
          ${file.title}
        </p>
        <p class="text-gray-500 text-xs font-semibold mt-auto flex items-center gap-1">
          <i class="far fa-calendar-alt"></i> ${file.year}
        </p>
      `;

      // susun struktur card
      card.appendChild(link);
      card.appendChild(textDiv);
      container.appendChild(card);

      // Daftarkan card baru ke observer
      observer.observe(card);

      // Render PDF ke thumbnail canvas
      const loadingTask = pdfjsLib.getDocument(file.url);
      loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(page => {
          // Naikkan scale sedikit agar text di preview PDF terlihat lebih tajam
          const viewport = page.getViewport({ scale: 0.5 }); 
          const context = canvas.getContext('2d');
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          page.render({
            canvasContext: context,
            viewport: viewport
          });
        });
      }).catch(err => console.warn("Gagal memuat preview PDF: " + file.url, err));
    });
  }
});