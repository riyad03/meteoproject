"use client"

import ImportComponent from "@/app/pages/Imp/Imp_page"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header>

      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <section data-name="menu"></section>
        <section data-name="mainPage">
          <ImportComponent/>
        </section>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
