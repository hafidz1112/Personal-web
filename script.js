document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  // Toggle menu navbar mobile
  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // Setup Intersection Observer untuk animasi scroll
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate__animated", "animate__fadeInUp");
        entry.target.classList.remove("opacity-0"); 
        observer.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => observer.observe(el));

  // ========================================================
  // LOGIKA AMBIL DATA PORTFOLIO DARI FILE PROJECTS.JSON
  // ========================================================
  fetch("projects.json")
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat projects.json");
      return response.json();
    })
    .then(projectFiles => {
      const projectsGrid = document.getElementById("projects-grid");
      if (!projectsGrid) return;

      projectFiles.forEach(project => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between animate-on-scroll opacity-0 h-full";

        // Membuat elemen badge untuk tech stack secara dinamis
        const tagsHTML = project.tags.map(tag => {
          let colorClass = "bg-gray-50 text-gray-600";
          if (tag === "Laravel") colorClass = "bg-orange-50 text-orange-600";
          if (tag === "React" || tag === "Express") colorClass = "bg-blue-50 text-blue-600";
          if (tag === "Tailwind CSS") colorClass = "bg-sky-50 text-sky-600";
          if (tag === "Node.js") colorClass = "bg-green-50 text-green-600";
          if (tag === "IoT") colorClass = "bg-red-50 text-red-600";

          return `<span class="text-[11px] font-medium ${colorClass} px-2 py-0.5 rounded-md">${tag}</span>`;
        }).join("");

        card.innerHTML = `
          <div>
              <div class="h-48 w-full bg-gray-200 overflow-hidden relative group">
                  <img src="${project.image}" alt="${project.title} Screenshot" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                  <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      ${project.category}
                  </div>
              </div>
              <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-800 mb-1.5">${project.title}</h3>
                  <p class="text-sm text-gray-600 leading-relaxed mb-4">${project.description}</p>
                  <div class="flex flex-wrap gap-1.5">${tagsHTML}</div>
              </div>
          </div>
          <div class="p-6 pt-0 flex gap-3">
              <a href="${project.sourceCode}" target="_blank" class="flex-1 py-2 text-center text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition duration-200 flex items-center justify-center gap-1.5">
                  <i class="fab fa-github"></i> ${project.title === "Smart Garden Dashboard" ? "Repository" : "Source Code"}
              </a>
              <a href="${project.liveDemo}" target="_blank" class="flex-1 py-2 text-center text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-xl transition duration-200 flex items-center justify-center gap-1.5">
                  <i class="fas fa-external-link-alt text-[10px]"></i> ${project.title === "Smart Garden Dashboard" ? "View Demo" : "Live Demo"}
              </a>
          </div>
        `;
        projectsGrid.appendChild(card);
        observer.observe(card); // Aktifkan animasi scroll untuk card proyek yang baru di-inject
      });
    })
    .catch(error => console.error("Error loading projects:", error));

  // Flag untuk memastikan sertifikat hanya diproses sekali saat tab dibuka
  let pdfRendered = false;

  // Fungsi filter tab navigasi bawah
  function showTab(tab) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));

    const activeTab = document.getElementById(tab);
    if (activeTab) {
      activeTab.classList.remove("hidden");
      
      const cardsInTab = activeTab.querySelectorAll(".animate-on-scroll, .opacity-0");
      cardsInTab.forEach(card => {
        card.classList.add("animate__animated", "animate__fadeInUp");
        card.classList.remove("opacity-0");
      });

      if (tab === 'sertificate' && !pdfRendered) {
        renderCertificates();
        pdfRendered = true; 
      }
    }

    document.querySelectorAll("#btn-skills, #btn-pengalaman, #btn-sertificate")
      .forEach(btn => {
        btn.classList.remove("text-black", "border-black");
        btn.classList.add("text-gray-600", "border-transparent");
      });

    const targetBtn = document.getElementById("btn-" + tab);
    if (targetBtn) {
      targetBtn.classList.remove("text-gray-600", "border-transparent");
      targetBtn.classList.add("text-black", "border-black");
    }
  }

  // Ikat Event Listener ke Tombol Filter HTML
  const btnSkills = document.getElementById("btn-skills");
  const btnPengalaman = document.getElementById("btn-pengalaman");
  const btnSertificate = document.getElementById("btn-sertificate");

  if (btnSkills) btnSkills.addEventListener("click", () => showTab("skills"));
  if (btnPengalaman) btnPengalaman.addEventListener("click", () => showTab("pengalaman"));
  if (btnSertificate) btnSertificate.addEventListener("click", () => showTab("sertificate"));

  // Load data skills.json secara asinkronus
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

      showTab("skills");
    })
    .catch(error => {
      console.error("Error loading skills:", error);
      showTab("skills"); 
    });
  
  // Fungsi merender seluruh data sertifikat
  function renderCertificates() {
    const certificateFiles = [
      { url: "assets/skils/AlibabaCloudCertifikat.png", title: "AlibabaCloudCertifikat", year: "2024", isImage: true, imageSrc: "assets/skils/AlibabaCloudCertifikat.png" },
      { url: "assets/pdf/sertifikat MTCNA.pdf", title: "Mikrotik MTCNA", year: "2025", isImage: false },
      { url: "assets/pdf/certificateHTML.pdf", title: "Sertifikat HTML dasar Codepolitan", year: "2024", isImage: false },
      { url: "assets/pdf/Certificate Javascript OOP - CODEPOLITAN.pdf", title: "Certificate Javascript OOP - CODEPOLITAN", year: "2024", isImage: false },
      { url: "assets/pdf/Certificate AjaX dan API - CODEPOLITAN.pdf", title: "Certificate AjaX dan API - CODEPOLITAN", year: "2024", isImage: false },
      { url: "assets/pdf/Certificate MogoDB- CODEPOLITAN.pdf", title: "Certificate MogoDB- CODEPOLITAN", year: "2024", isImage: false },
      { url: "assets/pdf/Certificate Studi Kasus - CODEPOLITAN.pdf", title: "Certificate Studi Kasus - CODEPOLITAN", year: "2024", isImage: false },
      { url: "assets/pdf/Belajar Back-End Pemula dengan JavaScript.pdf", title: "Belajar Back-End Pemula dengan JavaScript", year: "2026", isImage: false },
      { url: "assets/pdf/Belajar Fundamental Back-End dengan JavaScript.pdf", title: "Belajar Fundamental Back-End dengan JavaScript", year: "2026", isImage: false },
      { url: "assets/pdf/Belajar Membuat Aplikasi Web dengan React.pdf", title: "Belajar Membuat Aplikasi Web dengan React", year: "2026", isImage: false },
      { url: "assets/pdf/Belajar Fundamental Aplikasi Web dengan React.pdf", title: "Belajar Fundamental Aplikasi Web dengan React", year: "2024", isImage: false },
      { url: "assets/pdf/Belajar Dasar Pemrograman JavaScript.pdf", title: "Belajar Dasar Pemrograman JavaScript", year: "2026", isImage: false },
      { url: "assets/pdf/Belajar Membuat Front-End Web untuk Pemula.pdf", title: "Belajar Membuat Front-End Web untuk Pemula", year: "2026", isImage: false },
      { url: "assets/pdf/Belajar Dasar Pemrograman Web.pdf", title: "Belajar Dasar Pemrograman Web", year: "2026", isImage: false },
      { url: "assets/pdf/AWS.pdf", title: "Belajar Dasar Cloud dan Gen AI di AWS", year: "2024", isImage: false },
      { url: "assets/pdf/Pengenalan ke Logika Pemrograman.pdf", title: "Pengenalan ke Logika Pemrograman", year: "2026", isImage: false },
      { url: "assets/pdf/Memulai Dasar Pemrograman.pdf", title: "Memulai Dasar Pemrograman untuk Menjadi Pengembang Software", year: "2026", isImage: false },
      { url: "assets/pdf/Hack Point-Muhammad_Hafidz.pdf", title: "Hack Point-Muhammad_Hafidz", year: "2024", isImage: false }
    ];

    const container = document.getElementById("pdf-grid");
    if (!container) return;

    certificateFiles.forEach((file) => {
      const card = document.createElement("div");
      card.className = "flex flex-col bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100 animate-on-scroll h-full";

      const canvasWrapper = document.createElement("div");
      canvasWrapper.className = "h-48 w-full flex items-center justify-center bg-gray-50 overflow-hidden p-2 border-b border-gray-100 relative z-0"; 

      if (file.isImage) {
        const img = document.createElement("img");
        img.src = file.imageSrc;
        img.alt = file.title;
        img.className = "mx-auto max-w-full max-h-full object-cover rounded-md";
        canvasWrapper.appendChild(img);
      } else {
        const canvas = document.createElement("canvas");
        canvas.className = "mx-auto max-w-full max-h-full object-contain"; 
        canvasWrapper.appendChild(canvas);

        pdfjsLib.getDocument(file.url).promise.then(pdf => {
          pdf.getPage(1).then(page => {
            const viewport = page.getViewport({ scale: 0.4 }); 
            const context = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({ canvasContext: context, viewport: viewport });
          });
        }).catch(err => console.warn("Gagal memuat preview PDF: " + file.url, err));
      }

      const link = document.createElement("a");
      link.href = file.url;
      link.target = "_blank";
      link.className = "block w-full hover:opacity-90 transition"; 
      link.appendChild(canvasWrapper);

      const textDiv = document.createElement("div");
      textDiv.className = "p-4 bg-white flex flex-col justify-between flex-grow relative z-10 text-left";
      textDiv.innerHTML = `
        <p class="font-bold text-gray-800 text-[15px] line-clamp-2 mb-2" title="${file.title}">${file.title}</p>
        <p class="text-gray-500 text-xs font-semibold mt-auto flex items-center gap-1">
          <i class="far fa-calendar-alt"></i> ${file.year}
        </p>
      `;

      card.appendChild(link);
      card.appendChild(textDiv);
      container.appendChild(card);
      observer.observe(card);
    });
  }
});