const { useMemo, useEffect } = React;

const Home = () => {
  useEffect(() => {
    document.title = 'K-Biz Consulting — Innovative consulting for a smarter growth';
  }, []);

  return (
    <div className="w-full flex flex-col font-sans text-[10px] items-center text-[#0C0C0C]">

      {/* Hero Section */}
      <section className="relative w-full max-w-[1440px] h-[623px] flex flex-col overflow-hidden">
        {/* Background Gradients & Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F3F8F0] via-[rgba(184,0,255,0.91)_37.5%] to-[rgba(61,0,85,0.85)_100%] z-10" />
        <div className="absolute inset-0 z-0">
          <picture>
            <img
              src="/site-assets/hero-nhatrang.jpg"
              alt="Nha Trang Beach's view"
              className="w-full h-full object-cover object-[50%_44%]"
            />
          </picture>
        </div>

        {/* Top/Bottom Divider graphics from HTML */}
        <div className="absolute top-0 w-full h-[80px] z-10 opacity-25" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' data-bbox='0 100 1920 200' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 w-full h-[60px] z-10 opacity-33" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' data-bbox='0 100 1920 200' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 w-full h-[40px] z-10 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' data-bbox='0 100 1920 200' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")" }} />

        <div className="absolute bottom-0 w-full h-[400px] z-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='xMidYMax slice' viewBox='0 110.383 1918.787 188.022' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1918.787 259.428v38.977H0v-38.977h1918.787z'/%3E%3Cpath fill='%23B800FF' d='m0 255.197 1918.787 2.4v-2.876L0 248.522v6.675z'/%3E%3Cpath fill='%23B800FF' d='m0 243.073 1918.787 7.399v-2.985L0 235.989v7.084z'/%3E%3Cpath fill='%23B800FF' d='m0 230.676 1918.787 12.698v-3.048L0 223.728v6.948z'/%3E%3Cpath fill='%23B800FF' d='m0 218.823 1918.787 17.498v-3.084L0 211.739v7.084z'/%3E%3Cpath fill='%23B800FF' d='m0 206.29 1918.787 22.798v-3.221L0 199.07v7.22z'/%3E%3Cpath fill='%23B800FF' d='m0 193.893 1918.787 27.997v-3.293L0 186.4v7.493z'/%3E%3Cpath fill='%23B800FF' d='m0 181.496 1918.787 33.296v-3.365L0 173.731v7.765z'/%3E%3Cpath fill='%23B800FF' d='m0 167.464 1918.787 39.696v-3.728L0 158.337v9.127z'/%3E%3Cpath fill='%23B800FF' d='m0 152.479 1918.787 46.895v-3.756L0 143.624v8.855z'/%3E%3Cpath fill='%23B800FF' d='m0 136.948 1918.787 54.394v-4.136L0 127.412v9.536z'/%3E%3Cpath fill='%23B800FF' d='M0 110.383v10.49l1918.787 62.093v-4.59L0 110.383z'/%3E%3C/svg%3E\")" }} />

        <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-4">
          <h1 className="text-white text-[56.4px] font-normal leading-[62.08px] tracking-[-2.25px] w-[561px] max-w-full">
            INNOVATIVE CONSULTING FOR A SMARTER GROWTH
          </h1>
          <p className="mt-4 text-white text-[16px] font-normal">
            As experts from Khánh Hòa, we’re here to be your consulting partner on the business journey
          </p>

          <div className="mt-8 flex flex-col items-center">
            <a href="/project-case-studies" className="flex flex-col items-center group">
              <div className="w-[100px] h-[100px] rounded-full border border-white flex justify-center items-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <svg width="40" height="40" viewBox="20 41.091 160 117.822" fill="currentColor">
                  <path d="M28 92h-8v16h8V92zm149.657 13.657a8 8 0 0 0 0-11.314l-50.912-50.912a8 8 0 0 0-11.314 11.314L160.687 100l-45.255 45.255a8 8 0 0 0 11.314 11.314l50.911-50.912zM28 108h144V92H28v16z"/>
                </svg>
              </div>
              <span className="mt-4 text-white text-[12px] uppercase font-bold tracking-widest group-hover:opacity-80">
                VIEW PROJECTS
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="relative w-full max-w-[1440px] min-h-[224px] pt-[54px] px-[48px] pl-[64px] bg-[#F3F8F0]">
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[rgba(184,0,255,0.15)] to-transparent" />

        <div className="relative z-10 flex flex-col w-full">
          <div className="flex justify-between items-end mb-[40px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="2.665 2.667 10.667 10.666" fill="#343434">
                  <path d="M7.999 2.667 13.332 8l-5.333 5.333H2.665V2.667z" />
                </svg>
                <h2 className="text-[20px] font-normal uppercase tracking-wider text-[#343434]">RECENT PROJECTS</h2>
              </div>
              <p className="text-[14px] text-gray-600">Discover our latest projects & case studies</p>
            </div>
            <a href="/project-case-studies" className="text-brand-darkGreen font-mono text-[14px] hover:underline flex items-center gap-2">
              <svg width="16" height="16" viewBox="2.665 2.667 10.667 10.666" fill="#DBFDEB" className="bg-[#DBFDEB] rounded-full">
                  <path d="M7.999 2.667 13.332 8l-5.333 5.333H2.665V2.667z" fill="#005E2C" />
              </svg>
              MORE PROJECTS
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6 pb-[60px]">
            {/* Project 1 */}
            <a href="/project-case-studies/frank-zhang" className="group block">
              <div className="aspect-[4/3] bg-gray-200 overflow-hidden rounded-md mb-3">
                <img src="/site-assets/project-frank-zhang.jpg" alt="Project 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-[14px] font-bold group-hover:text-brand-darkPurple transition-colors">Add paragraph text. Click “Edit”</p>
            </a>
            {/* Project 2 */}
            <a href="/project-case-studies/cho-dam" className="group block">
              <div className="aspect-[4/3] bg-gray-200 overflow-hidden rounded-md mb-3">
                <img src="/site-assets/project-cho-dam.jpg" alt="Project 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-[14px] font-bold group-hover:text-brand-darkPurple transition-colors">Add paragraph text. Click “Edit”</p>
            </a>
            {/* Project 3 */}
            <a href="/project-case-studies/sup-2" className="group block">
              <div className="aspect-[4/3] bg-gray-200 overflow-hidden rounded-md mb-3">
                <img src="/site-assets/project-sup2.jpg" alt="Project 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-[14px] font-bold group-hover:text-brand-darkPurple transition-colors">Add paragraph text. Click “Edit”</p>
            </a>
            {/* Project 4 */}
            <a href="/project-case-studies/z596" className="group block">
              <div className="aspect-[4/3] bg-gray-200 overflow-hidden rounded-md mb-3">
                <img src="/site-assets/project-z596.jpg" alt="Project 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-[14px] font-bold group-hover:text-brand-darkPurple transition-colors">Add paragraph text. Click “Edit”</p>
            </a>
          </div>
        </div>
      </section>

      {/* Estimate/Contact Section */}
      <section className="relative w-full max-w-[1440px] h-[300px] flex items-center bg-[#B800FF] px-[48px]">
        <div className="absolute top-0 w-full h-[150px] opacity-25 z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23E7AAFF' d='m0 300 960-200 960 200H0z'/%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 w-full h-[150px] opacity-33 z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23E7AAFF' d='m0 300 960-200 960 200H0z'/%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 w-full h-[150px] opacity-50 z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23E7AAFF' d='m0 300 960-200 960 200H0z'/%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 w-[558px]">
          <h4 className="text-[32px] text-white leading-tight font-normal">
            Get an estimate for your upcoming project
          </h4>
        </div>
        <div className="relative z-10 ml-auto flex gap-4">
          <a href="/contact" className="bg-brand-green text-black px-8 py-3 rounded-full text-[14px] font-bold hover:bg-white transition-colors">
            Contact
          </a>
          <a href="/contact" className="bg-brand-purple text-white px-8 py-3 rounded-full text-[14px] font-bold hover:bg-opacity-80 transition-colors">
            Contact
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full max-w-[1440px] bg-[#F3F8F0] py-[80px] px-[48px]">
        <div className="grid grid-cols-2 gap-x-12 gap-y-[60px]">
          {/* Testimonial 1 */}
          <div>
            <p className="text-[12px] uppercase font-bold tracking-widest text-[#343434] mb-4">WHAT CLIENTS SAY</p>
            <p className="text-[24px] italic text-[#343434] mb-6">"I could not have performed any of these tasks with a successful outcome, without the professional work performed by K-Biz’s team."</p>
            <p className="font-bold text-[14px] text-[#0C0C0C]">Mr. Paul Anthony Hinkley</p>
            <p className="text-[14px] text-gray-600">(Properties Management, 2014 - 2015)</p>
          </div>
          {/* Testimonial 2 */}
          <div>
            <p className="text-[12px] uppercase font-bold tracking-widest text-[#343434] mb-4">WHAT CLIENTS SAY</p>
            <p className="text-[24px] italic text-[#343434] mb-6">“I've had the pleasure of working with the K-Biz team and appreciate their valuable insights on investment and law in Nha Trang.”</p>
            <p className="font-bold text-[14px] text-[#0C0C0C]">Mr. Peter Allen – Managing Partner</p>
            <p className="text-[14px] text-gray-600">NT Ventures</p>
          </div>
          {/* Testimonial 3 */}
          <div>
            <p className="text-[12px] uppercase font-bold tracking-widest text-[#343434] mb-4">WHAT CLIENTS SAY</p>
            <p className="text-[24px] italic text-[#343434] mb-6">“I’m grateful to K-Biz for helping me start my business in Khanh Hoa. To future clients, I confidently recommend the K-Biz Team.”</p>
            <p className="font-bold text-[14px] text-[#0C0C0C]">Mr. Sim Hyun Woo</p>
            <p className="text-[14px] text-gray-600">Former Director S-Global Vietnam Co., Ltd</p>
          </div>
          {/* Testimonial 4 */}
          <div>
            <p className="text-[12px] uppercase font-bold tracking-widest text-[#343434] mb-4">WHAT CLIENTS SAY</p>
            <p className="text-[24px] italic text-[#343434] mb-6">"When we faced serious challenges starting our business in Vietnam, K-Biz helped us overcome them with accurate information and timely support. Since then, they’ve been a trusted partner, and I wholeheartedly recommend their services to anyone looking to start a business in Vietnam."</p>
            <p className="font-bold text-[14px] text-[#0C0C0C]">Mr. Crag Anderson</p>
            <p className="text-[14px] text-gray-600">Scuba Sports Commercial Services Co., Ltd</p>
          </div>
        </div>
      </section>

    </div>
  );
};

Object.assign(window, { Home });
