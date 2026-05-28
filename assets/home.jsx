const { useMemo, useEffect } = React;

const Home = () => {
  useEffect(() => {
    document.title = 'K-Biz Consulting — Innovative consulting for a smarter growth';
  }, []);

  return (
    <div className="w-full flex flex-col font-sans text-[10px] items-center text-[#0C0C0C]">

      {/* Hero Section */}
      <section className="relative w-full h-[720px] flex flex-col overflow-hidden">
        {/* Background Gradients & Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(61,0,85,0.95)] via-[rgba(184,0,255,0.75)_35%] via-[rgba(184,0,255,0.3)_55%] to-transparent z-10" />
        <div className="absolute inset-0 z-0">
          <picture>
            <img
              src="/site-assets/hero-nhatrang.jpg"
              alt="Nha Trang Beach's view"
              className="w-full h-full object-cover object-[50%_44%]"
            />
          </picture>
        </div>

        {/* No shape divider at the bottom of Hero (it belongs to the top of Services Section) */}

        <div className="relative z-20 flex flex-col justify-center h-full w-full px-[40px]">
          <h1 className="text-white text-[56.4px] font-normal leading-[62.08px] tracking-[-2.25px] w-[561px] max-w-full">
            INNOVATIVE CONSULTING FOR A SMARTER GROWTH
          </h1>
          <p className="mt-4 text-white text-[16px] font-normal w-[540px] max-w-full leading-[24px]">
            As experts from Khánh Hòa, we’re here to be your consulting partner on the business journey
          </p>

          <div className="mt-8 flex">
            <a href="/project-case-studies" className="flex items-center gap-4 group">
              <div className="w-[44px] h-[44px] bg-[#B7FCD7] flex justify-center items-center group-hover:bg-white transition-colors duration-300">
                <svg width="20" height="20" viewBox="20 41.091 160 117.822" fill="#0C0C0C">
                  <path d="M28 92h-8v16h8V92zm149.657 13.657a8 8 0 0 0 0-11.314l-50.912-50.912a8 8 0 0 0-11.314 11.314L160.687 100l-45.255 45.255a8 8 0 0 0 11.314 11.314l50.911-50.912zM28 108h144V92H28v16z"/>
                </svg>
              </div>
              <span className="text-white text-[12px] uppercase font-bold tracking-widest group-hover:opacity-80">
                VIEW PROJECTS
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative w-full bg-[#E8FFF3] py-[80px]">
        {/* Top shape divider (Wix top divider of Services section comp-lypuug4x, slants down from left to right, fanning out) */}
        <div className="absolute top-0 left-0 w-full h-[142px] overflow-hidden pointer-events-none z-10 opacity-[0.84]">
          {/* Layer 3 (opacity 0.25) */}
          <div className="absolute top-0 left-0 w-full h-[142px] opacity-[0.25]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, -1)"
          }} />
          {/* Layer 2 (opacity 0.33) */}
          <div className="absolute top-0 left-0 w-full h-[114px] opacity-[0.33]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, -1)"
          }} />
          {/* Layer 1 (opacity 0.50) */}
          <div className="absolute top-0 left-0 w-full h-[86px] opacity-[0.50]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, -1)"
          }} />
          {/* Layer 0 (Base Purple Layer, opacity 1.0) */}
          <div className="absolute top-0 left-0 w-full h-[58px]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, -1)"
          }} />
        </div>

        <div className="w-full px-[40px] relative z-20">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="2.665 2.667 10.667 10.666" fill="#005E2C">
              <path d="M7.999 2.667 13.332 8l-5.333 5.333H2.665V2.667z" />
            </svg>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005E2C]">SERVICES</h2>
          </div>
          <h3 className="text-[36px] font-normal text-[#3D0055] leading-tight mb-12">
            Diverse solutions tailored to your business
          </h3>

          <div className="grid grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="aspect-[4/3] w-full overflow-hidden mb-6">
                <img src="/site-assets/svc-consulting-3.jpg" alt="Business Development" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[16px] font-bold text-[#3D0055] uppercase tracking-wider mb-3 px-2 min-h-[48px] flex items-center">
                BUSINESS DEVELOPMENT SUPPORT
              </h4>
              <p className="text-[14px] text-gray-600 leading-[22px] mb-8 px-4 min-h-[88px]">
                Want your business to truly break through? K-Biz offers specialized support to optimize operations, sparking innovation and continuous growth
              </p>
              <a href="/services/consulting-3" className="mt-auto px-8 py-3 bg-[#5C2D82] text-white rounded-sm font-bold text-[14px] hover:bg-[#4A2368] transition-colors">
                Read More
              </a>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="aspect-[4/3] w-full overflow-hidden mb-6">
                <img src="/site-assets/svc-consulting-1.jpg" alt="Investment Consulting" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[16px] font-bold text-[#3D0055] uppercase tracking-wider mb-3 px-2 min-h-[48px] flex items-center">
                INVESTMENT CONSULTING
              </h4>
              <p className="text-[14px] text-gray-600 leading-[22px] mb-8 px-4 min-h-[88px]">
                Got an investment idea? K-Biz helps you turn it into real profit, partnering with you to ensure your project thrives sustainably.
              </p>
              <a href="/services/consulting-1" className="mt-auto px-8 py-3 bg-[#5C2D82] text-white rounded-sm font-bold text-[14px] hover:bg-[#4A2368] transition-colors">
                Read More
              </a>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="aspect-[4/3] w-full overflow-hidden mb-6">
                <img src="/site-assets/svc-consulting-2.jpg" alt="New Business Launching" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[16px] font-bold text-[#3D0055] uppercase tracking-wider mb-3 px-2 min-h-[48px] flex items-center">
                NEW BUSINESS LAUNCHING
              </h4>
              <p className="text-[14px] text-gray-600 leading-[22px] mb-8 px-4 min-h-[88px]">
                Thinking of a fresh start? Let K-Biz streamline all the procedures, giving your business a solid foundation from day one.
              </p>
              <a href="/services/consulting-2" className="mt-auto px-8 py-3 bg-[#5C2D82] text-white rounded-sm font-bold text-[14px] hover:bg-[#4A2368] transition-colors">
                Read More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative w-full h-[480px] flex flex-col overflow-hidden">
        {/* Background Gradient & Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(61,0,85,0.95)] via-[rgba(184,0,255,0.75)_35%] via-[rgba(184,0,255,0.3)_55%] to-transparent z-10" />
        <div className="absolute inset-0 z-0">
          <picture>
            <img
              src="/site-assets/team-group.jpg"
              alt="K-Biz Team Group"
              className="w-full h-full object-cover"
            />
          </picture>
        </div>

        {/* Top shape divider (Wix bottom divider of Services section, slants down from left to right, fanning out on the right) */}
        <div className="absolute top-0 left-0 w-full h-[112px] overflow-hidden z-20 pointer-events-none">
          {/* Layer 3 (opacity 0.25) */}
          <div className="absolute top-0 w-full h-[112px] opacity-[0.25]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%"
          }} />
          {/* Layer 2 (opacity 0.33) */}
          <div className="absolute top-0 w-full h-[84px] opacity-[0.33]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%"
          }} />
          {/* Layer 1 (opacity 0.50) */}
          <div className="absolute top-0 w-full h-[56px] opacity-[0.50]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%"
          }} />
          {/* Layer 0 (Base Purple Layer, opacity 1.0) */}
          <div className="absolute top-0 w-full h-[28px]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            zIndex: 1
          }} />
        </div>

        {/* Bottom shape divider (Wix bottom divider of Banner section, slants down from left to right, fanning out on the left) */}
        <div className="absolute bottom-0 left-0 w-full h-[112px] overflow-hidden z-20 pointer-events-none">
          {/* Layer 3 (opacity 0.25) */}
          <div className="absolute bottom-0 w-full h-[112px] opacity-[0.25]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, 1)"
          }} />
          {/* Layer 2 (opacity 0.33) */}
          <div className="absolute bottom-0 w-full h-[84px] opacity-[0.33]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, 1)"
          }} />
          {/* Layer 1 (opacity 0.50) */}
          <div className="absolute bottom-0 w-full h-[56px] opacity-[0.50]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            transform: "scale(-1, 1)"
          }} />
          {/* Layer 0 (Base Purple Layer, opacity 1.0) */}
          <div className="absolute bottom-0 w-full h-[28px]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23B800FF' d='M1920 300 0 100v200h1920z'/%3E%3C/svg%3E\")",
            backgroundSize: "100% 100%",
            zIndex: 1,
            transform: "scale(-1, 1)"
          }} />
        </div>

        <div className="relative z-30 flex flex-col justify-center h-full w-full px-[40px]">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="2.665 2.667 10.667 10.666" fill="#B7FCD7">
              <path d="M7.999 2.667 13.332 8l-5.333 5.333H2.665V2.667z" />
            </svg>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#B7FCD7]">ABOUT K-BIZ CONSULTING</h2>
          </div>
          <h1 className="text-white text-[48px] font-bold leading-none mb-4">
            WORK WITH PASSION
          </h1>
          <p className="text-white text-[16px] font-normal w-[600px] max-w-full leading-[26px] mb-8">
            With decades of extensive industry experience supporting organisations through critical challenges, our teams of professionals provide concrete, actionable advice to design and guide strategy.
          </p>

          <div className="flex">
            <a href="/team-members-1" className="flex items-center gap-4 group">
              <div className="w-[44px] h-[44px] bg-[#B7FCD7] flex justify-center items-center group-hover:bg-white transition-colors duration-300">
                <svg width="20" height="20" viewBox="20 41.091 160 117.822" fill="#0C0C0C">
                  <path d="M28 92h-8v16h8V92zm149.657 13.657a8 8 0 0 0 0-11.314l-50.912-50.912a8 8 0 0 0-11.314 11.314L160.687 100l-45.255 45.255a8 8 0 0 0 11.314 11.314l50.911-50.912zM28 108h144V92H28v16z"/>
                </svg>
              </div>
              <span className="text-white text-[12px] uppercase font-bold tracking-widest group-hover:opacity-80">
                ABOUT US
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="relative w-full bg-[#E8FFF3] py-[80px]">
        <div className="w-full px-[40px]">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="2.665 2.667 10.667 10.666" fill="#005E2C">
              <path d="M7.999 2.667 13.332 8l-5.333 5.333H2.665V2.667z" />
            </svg>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005E2C]">CASE STUDIES</h2>
          </div>
          <h3 className="text-[36px] font-normal text-[#3D0055] leading-tight mb-12">
            Discover our latest projects & case studies
          </h3>

          {/* First Row: Market Case Study Grid */}
          <div className="grid grid-cols-12 gap-8 mb-12">
            {/* Left Column: White Info Card */}
            <div className="col-span-5 bg-[#FFFFFF] p-12 flex flex-col justify-between relative min-h-[380px] shadow-sm border border-gray-100 rounded-sm">
              <div>
                <p className="text-[12px] font-bold text-[#005E2C] uppercase tracking-wider mb-4">CASE STUDIES</p>
                <h4 className="text-[22px] font-bold text-[#3D0055] leading-tight mb-4">
                  Perspective on Traditional Market Model – Part 1: The hub market in Bazar...
                </h4>
                <p className="text-[14px] text-gray-700 leading-[22px] mb-8">
                  A comprehensive look at traditional markets in the modern economy, focusing on Bazar hub market's vital role...
                </p>
              </div>
              <div className="flex items-end justify-between">
                <a href="/project-case-studies/cho-dam" className="px-8 py-3 bg-[#5C2D82] text-white rounded-sm font-bold text-[14px] hover:bg-[#4A2368] transition-colors">
                  Read More
                </a>
                {/* Arrow Controls */}
                <div className="flex bg-white border border-gray-200">
                  <button className="p-3 hover:bg-gray-100 border-r border-gray-200" aria-label="Previous">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button className="p-3 hover:bg-gray-100" aria-label="Next">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Cho Dam Image */}
            <div className="col-span-7 overflow-hidden h-[380px]">
              <img src="/site-assets/project-cho-dam.jpg" alt="Cho Dam Market" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Second Row: Van Phong Plant Image */}
          <div className="relative w-full h-[400px] overflow-hidden group">
            <img src="/site-assets/project-vanphong.jpg" alt="Van Phong 1 BOT Thermal Power Plant" className="w-full h-full object-cover" />
            {/* Bright Purple Transparent Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-[rgba(184,0,255,0.85)] py-6 text-center z-10">
              <h4 className="text-white text-[24px] font-bold tracking-wider mb-1">
                VAN PHONG 1 BOT THERMAL POWER PLANT
              </h4>
              <p className="text-[#B7FCD7] text-[14px] font-medium tracking-wide">
                Investment Consulting - 2018
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full bg-[#E8FFF3] py-[100px]">
        <div className="w-full max-w-[1440px] mx-auto px-[48px] pl-[64px] text-center relative">
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">WHAT CLIENTS SAY</p>
          <div className="max-w-[900px] mx-auto">
            <p className="text-[32px] italic text-[#3D0055] font-normal leading-[48px] mb-8">
              "I could not have performed any of these tasks with a successful outcome, without the professional work performed by K-Biz’s team."
            </p>
            <p className="font-bold text-[16px] text-[#0C0C0C] uppercase tracking-wider mb-1">
              Mr. Paul Anthony Hinkley
            </p>
            <p className="text-[14px] text-gray-600 font-medium">
              Properties Management, 2014 - 2015
            </p>
          </div>
          {/* Slider controls */}
          <div className="absolute right-[48px] top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button className="w-8 h-8 rounded-full border border-gray-300 flex justify-center items-center hover:bg-white transition-colors" aria-label="Previous">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-300 flex justify-center items-center hover:bg-white transition-colors" aria-label="Next">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Meet Our Expert Section */}
      <section className="relative w-full bg-[#FFFFFF] py-[80px]">
        <div className="w-full px-[40px] grid grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="2.665 2.667 10.667 10.666" fill="#005E2C">
                <path d="M7.999 2.667 13.332 8l-5.333 5.333H2.665V2.667z" />
              </svg>
              <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005E2C]">K-BIZ MEMBERS</h2>
            </div>
            <h3 className="text-[64px] font-bold text-[#B800FF] leading-[68px] mb-8">
              MEET<br />OUR<br />EXPERT
            </h3>
            <p className="text-[16px] text-gray-700 leading-[26px] max-w-[480px] mb-8">
              We've successfully supported numerous projects, contributed to local reforms, and built a strong reputation for trust and expertise.
            </p>
            <a href="/team-members-1" className="w-[44px] h-[44px] bg-[#B7FCD7] flex justify-center items-center hover:bg-black hover:text-[#B7FCD7] text-black transition-colors duration-300" aria-label="View Experts">
              <svg width="20" height="20" viewBox="20 41.091 160 117.822" fill="currentColor">
                <path d="M28 92h-8v16h8V92zm149.657 13.657a8 8 0 0 0 0-11.314l-50.912-50.912a8 8 0 0 0-11.314 11.314L160.687 100l-45.255 45.255a8 8 0 0 0 11.314 11.314l50.911-50.912zM28 108h144V92H28v16z"/>
              </svg>
            </a>
          </div>

          {/* Right Column: Framed Photo */}
          <div className="flex justify-center relative">
            {/* Thick light green offset border box behind */}
            <div className="absolute -left-6 -bottom-6 w-[420px] h-[420px] border-[12px] border-[#B7FCD7] z-0" />
            {/* Actual Image */}
            <div className="relative z-10 w-[420px] h-[420px] overflow-hidden shadow-sm">
              <img src="/site-assets/team-huynh-thi-hang.png" alt="Huynh Thi Hang" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call To Action */}
      <section className="relative w-full h-[220px] flex items-center bg-[#B800FF] overflow-hidden">
        {/* Diagonal graphic overlays */}
        <div className="absolute inset-0 opacity-25 z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 100 1920 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23E7AAFF' d='m0 300 960-200 960 200H0z'/%3E%3C/svg%3E\")" }} />
        
        <div className="relative z-10 w-full px-[40px] flex flex-col justify-center items-center text-center">
          <h4 className="text-[28px] text-white font-normal mb-6">
            Get an estimate for your upcoming project
          </h4>
          <a href="/contact" className="bg-[#FFFFFF] text-black px-12 py-3.5 rounded-full text-[14px] font-bold hover:bg-[#DBFDEB] hover:text-[#005E2C] transition-colors">
            Contact
          </a>
        </div>
      </section>

    </div>
  );
};

Object.assign(window, { Home });
