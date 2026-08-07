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
  // LOGIKA MODAL DETAIL PROJECT & AMBIL DATA PROJECTS.JSON
  // ========================================================
  const modal = document.getElementById("project-modal");
  const modalCard = document.getElementById("project-modal-card");
  const closeModalBtn = document.getElementById("close-modal-btn");
  let loadedProjects = [];

  function openProjectModal(project, updateHash = true) {
    if (!modal) return;
    
    document.getElementById("modal-img").src = project.image || "";
    document.getElementById("modal-img").alt = project.title;
    document.getElementById("modal-category").textContent = project.category || "Web App";
    document.getElementById("modal-title").textContent = project.title;
    document.getElementById("modal-description").textContent = project.longDescription || project.description;

    // Render tags dinamis di modal
    const modalTags = document.getElementById("modal-tags");
    if (modalTags) {
      modalTags.innerHTML = (project.tags || []).map(tag => {
        let colorClass = "bg-gray-100 text-gray-700";
        if (tag === "Laravel") colorClass = "bg-orange-100 text-orange-700";
        if (tag === "React" || tag === "Express") colorClass = "bg-blue-100 text-blue-700";
        if (tag === "Tailwind CSS") colorClass = "bg-sky-100 text-sky-700";
        if (tag === "MySQL") colorClass = "bg-emerald-100 text-emerald-700";
        return `<span class="text-xs font-semibold ${colorClass} px-3 py-1 rounded-full">${tag}</span>`;
      }).join("");
    }

    // Render fitur utama jika ada
    const modalFeaturesContainer = document.getElementById("modal-features-container");
    const modalFeatures = document.getElementById("modal-features");
    if (modalFeatures && modalFeaturesContainer) {
      if (project.features && project.features.length > 0) {
        modalFeaturesContainer.classList.remove("hidden");
        modalFeatures.innerHTML = project.features.map(f => `<li class="flex items-center gap-2"><i class="fas fa-check-circle text-emerald-500 text-xs"></i> <span>${f}</span></li>`).join("");
      } else {
        modalFeaturesContainer.classList.add("hidden");
      }
    }

    // Render gallery thumbnails jika ada beberapa gambar
    const galleryContainer = document.getElementById("modal-gallery-container");
    const galleryThumbnails = document.getElementById("modal-gallery-thumbnails");
    const mainImg = document.getElementById("modal-img");

    if (galleryContainer && galleryThumbnails) {
      if (project.images && project.images.length > 1) {
        galleryContainer.classList.remove("hidden");
        galleryThumbnails.innerHTML = project.images.map((imgSrc, idx) => {
          const isActive = imgSrc === (project.image || project.images[0]);
          return `
            <button type="button" class="gallery-thumb-btn shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition duration-200 ${isActive ? 'border-yellow-500 ring-2 ring-yellow-500/50 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}" data-src="${imgSrc}">
              <img src="${imgSrc}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover">
            </button>
          `;
        }).join("");

        galleryThumbnails.querySelectorAll(".gallery-thumb-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const newSrc = btn.getAttribute("data-src");
            if (mainImg && newSrc) {
              mainImg.src = newSrc;
              galleryThumbnails.querySelectorAll(".gallery-thumb-btn").forEach(b => {
                b.classList.remove("border-yellow-500", "ring-2", "ring-yellow-500/50", "scale-105");
                b.classList.add("border-transparent", "opacity-70");
              });
              btn.classList.remove("border-transparent", "opacity-70");
              btn.classList.add("border-yellow-500", "ring-2", "ring-yellow-500/50", "scale-105");
            }
          });
        });
      } else {
        galleryContainer.classList.add("hidden");
      }
    }

    // Direct link tombol action modal
    const sourceBtn = document.getElementById("modal-source-btn");
    const demoBtn = document.getElementById("modal-demo-btn");
    if (sourceBtn) sourceBtn.href = project.sourceCode || "#";
    if (demoBtn) demoBtn.href = project.liveDemo || "#";

    // Tampilkan Modal dengan Animasi Soft
    modal.classList.remove("opacity-0", "pointer-events-none");
    modalCard.classList.remove("scale-95");
    modalCard.classList.add("scale-100");
    document.body.classList.add("overflow-hidden");

    // Perbarui URL tanpa reload (ngedirect ke URL hash baru di page yang sama)
    if (updateHash && project.id) {
      history.pushState({ projectId: project.id }, "", `#project-${project.id}`);
    }
  }

  function closeProjectModal(updateHash = true) {
    if (!modal) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    modalCard.classList.remove("scale-100");
    modalCard.classList.add("scale-95");
    document.body.classList.remove("overflow-hidden");

    if (updateHash && window.location.hash.startsWith("#project-")) {
      history.pushState(null, "", window.location.pathname + window.location.search + "#portfolio");
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => closeProjectModal());
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal && !modal.classList.contains("opacity-0")) {
        closeProjectModal();
      }
    }
  });

  // ========================================================
  // LOGIKA RENDER & FILTER UNTUK HALAMAN PROYEK (PROJECTS.HTML & INDEX.HTML)
  // ========================================================
  const searchInput = document.getElementById("search-all-projects");
  const allProjectsGrid = document.getElementById("all-projects-grid");
  const allProjectsCount = document.getElementById("all-projects-count");
  const noProjectsFound = document.getElementById("no-projects-found");

  let activeCategory = "all";

  function createProjectCard(project, animateScroll = true) {
    if (!project.id) {
      project.id = project.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    }

    const card = document.createElement("div");
    card.className = `bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer ${animateScroll ? 'animate-on-scroll opacity-0' : ''}`;

    const tagsHTML = (project.tags || []).map(tag => {
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
          <div class="h-48 w-full bg-gray-900 overflow-hidden relative group-hover:brightness-95 transition duration-300">
              <img src="${project.image}" alt="${project.title} Screenshot" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
              <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  ${project.category || 'Web App'}
              </div>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
                  <span class="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <i class="fas fa-search-plus"></i> Lihat Detail
                  </span>
              </div>
          </div>
          <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-1.5 group-hover:text-yellow-600 transition duration-200">${project.title}</h3>
              <p class="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">${project.description}</p>
              <div class="flex flex-wrap gap-1.5">${tagsHTML}</div>
          </div>
      </div>
      <div class="p-6 pt-0 flex gap-2">
          <button class="open-detail-btn flex-1 py-2 text-center text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-xs">
              <i class="fas fa-info-circle"></i> Lihat Detail
          </button>
          <a href="${project.sourceCode || '#'}" target="_blank" onclick="event.stopPropagation()" class="py-2 px-3 text-center text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition duration-200 flex items-center justify-center gap-1" title="Source Code">
              <i class="fab fa-github text-sm"></i>
          </a>
          <a href="${project.liveDemo || '#'}" target="_blank" onclick="event.stopPropagation()" class="py-2 px-3 text-center text-xs font-semibold bg-yellow-500 text-black hover:bg-yellow-400 rounded-xl transition duration-200 flex items-center justify-center gap-1" title="Live Demo">
              <i class="fas fa-external-link-alt text-[11px]"></i>
          </a>
      </div>
    `;

    card.addEventListener("click", () => {
      openProjectModal(project);
    });

    return card;
  }

  // ========================================================
  // SHADCN UI CUSTOM SELECT DROPDOWN LOGIC
  // ========================================================
  const selectTrigger = document.getElementById("shadcn-select-trigger");
  const selectMenu = document.getElementById("shadcn-select-menu");
  const selectValue = document.getElementById("shadcn-select-value");
  const selectArrow = document.getElementById("shadcn-select-arrow");
  const selectOptions = document.querySelectorAll(".shadcn-option");

  function toggleShadcnSelect() {
    if (!selectMenu) return;
    const isHidden = selectMenu.classList.contains("hidden");
    if (isHidden) {
      selectMenu.classList.remove("hidden");
      setTimeout(() => {
        selectMenu.classList.remove("scale-95", "opacity-0");
        selectMenu.classList.add("scale-100", "opacity-100");
      }, 10);
      selectArrow?.classList.add("rotate-180");
    } else {
      closeShadcnSelect();
    }
  }

  function closeShadcnSelect() {
    if (!selectMenu || selectMenu.classList.contains("hidden")) return;
    selectMenu.classList.remove("scale-100", "opacity-100");
    selectMenu.classList.add("scale-95", "opacity-0");
    selectArrow?.classList.remove("rotate-180");
    setTimeout(() => {
      selectMenu.classList.add("hidden");
    }, 150);
  }

  if (selectTrigger) {
    selectTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleShadcnSelect();
    });
  }

  selectOptions.forEach(opt => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = opt.getAttribute("data-value");
      const text = opt.querySelector("span")?.textContent || "Semua Kategori";

      activeCategory = val;
      if (selectValue) selectValue.textContent = text;

      // Update checkmark state
      selectOptions.forEach(o => {
        const check = o.querySelector(".check-icon");
        if (o === opt) {
          o.classList.add("bg-slate-100", "text-slate-900");
          o.classList.remove("text-slate-700");
          check?.classList.remove("hidden");
        } else {
          o.classList.remove("bg-slate-100", "text-slate-900");
          o.classList.add("text-slate-700");
          check?.classList.add("hidden");
        }
      });

      closeShadcnSelect();
      renderAllProjectsGrid();
    });
  });

  document.addEventListener("click", (e) => {
    if (selectMenu && !selectMenu.contains(e.target) && e.target !== selectTrigger) {
      closeShadcnSelect();
    }
  });

  function renderAllProjectsGrid() {
    if (!allProjectsGrid) return;
    const query = (searchInput?.value || "").toLowerCase().trim();
    const selectedCategory = activeCategory;

    const filtered = loadedProjects.filter(project => {
      const matchCat = selectedCategory === "all" || 
                       (project.category && project.category.toLowerCase() === selectedCategory.toLowerCase()) || 
                       (project.tags && project.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase()));
      const matchQuery = !query || 
                        project.title.toLowerCase().includes(query) || 
                        project.description.toLowerCase().includes(query) || 
                        (project.tags && project.tags.some(t => t.toLowerCase().includes(query)));
      return matchCat && matchQuery;
    });

    if (allProjectsCount) {
      allProjectsCount.textContent = filtered.length;
    }

    allProjectsGrid.innerHTML = "";

    if (filtered.length === 0) {
      noProjectsFound?.classList.remove("hidden");
    } else {
      noProjectsFound?.classList.add("hidden");
      filtered.forEach(project => {
        const card = createProjectCard(project, false);
        allProjectsGrid.appendChild(card);
      });
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderAllProjectsGrid);
  }

  function checkUrlHashForProject() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#project-")) {
      const projId = hash.replace("#project-", "");
      const found = loadedProjects.find(p => p.id === projId || p.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === projId);
      if (found) {
        openProjectModal(found, false);
      }
    } else {
      if (modal && !modal.classList.contains("opacity-0")) {
        closeProjectModal(false);
      }
    }
  }

  window.addEventListener("popstate", checkUrlHashForProject);

  fetch("projects.json")
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat projects.json");
      return response.json();
    })
    .then(projectFiles => {
      loadedProjects = projectFiles;

      // Render di index.html jika #projects-grid ada
      const projectsGrid = document.getElementById("projects-grid");
      if (projectsGrid) {
        projectFiles.forEach((project) => {
          const card = createProjectCard(project, true);
          projectsGrid.appendChild(card);
          observer.observe(card);
        });
      }

      // Render di projects.html jika #all-projects-grid ada
      if (allProjectsGrid) {
        renderAllProjectsGrid();
      }

      // Cek apakah ada Hash URL saat pertama kali di-load
      checkUrlHashForProject();
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