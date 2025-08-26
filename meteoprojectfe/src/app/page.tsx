"use client"

import ImportComponent from "@/app/pages/Imp/Imp_page"
import Header from "@/app/pages/header/header"

export default function Home() {
  return (
    <div>
        <header>
          <Header/>
        </header>
      
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
        
        <main className="flex flex-col row-start-2 items-center sm:items-start">
          <section data-name="menu"></section>
          <section data-name="mainPage">
            <ImportComponent/>
          </section>
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          
        </footer>
      </div>
    </div>
  );
}
