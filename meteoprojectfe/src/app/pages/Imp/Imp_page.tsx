
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" //needs npx shadcn@latest add table
import FileAutoImportForm from "./components/file-auto-import-form"
import {useState} from "react"
import FileImportManForm from "./components/file-man-import-form"
import ChargeDonnees from "./components/chargedonnee"
import RecentsComponent from "./components/recentscompenent" //needs npx shadcn@latest add Recents

export default function ImportComponent() {
  const processes = [
    {
      name: "Processus A",
      state: "Actif",
      creationDate: "2023-01-15",
      status: "Terminé",
      owner: "Jean Dupont",
      modificationDate: "2023-01-20",
    },
    {
      name: "Processus B",
      state: "Inactif",
      creationDate: "2023-02-01",
      status: "En cours",
      owner: "Marie Curie",
      modificationDate: "2023-02-05",
    },
    {
      name: "Processus C",
      state: "Actif",
      creationDate: "2023-03-10",
      status: "En attente",
      owner: "Pierre Martin",
      modificationDate: "2023-03-10",
    },
    {
      name: "Processus D",
      state: "Actif",
      creationDate: "2023-04-22",
      status: "Terminé",
      owner: "Sophie Dubois",
      modificationDate: "2023-04-25",
    },
    {
      name: "Processus E",
      state: "Inactif",
      creationDate: "2023-05-01",
      status: "Échec",
      owner: "Lucie Bernard",
      modificationDate: "2023-05-02",
    },
  ]
  const [autoActv,SetAutoActv]=useState(false);
  const [manActv,SetManActv]=useState(false);
  const fileAutoImportWind=(state:boolean)=>{
      SetAutoActv(state);
      
  }
  const fileManImportWind=(state:boolean)=>{
      SetManActv(state);
  }

  


  return (
    <div className="flex min-h-screen w-full">
    
     

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 ">
          {/* Charger les données section */}
          <ChargeDonnees SetAutoActv={SetAutoActv} SetManActv={SetManActv} />

          {/* Récents section */}
          <div className="grid gap-4">
            <RecentsComponent/>

            
            {/* Table */}
            <div className="overflow-auto rounded-lg border shadow-sm w-full">
              <Table className ="min-w-[1000px] text-sm md:text-base">
                <TableHeader className="bg-gray-100 ">
                  <TableRow>
                    <TableHead className ="px-6 py-3">Nom Processus</TableHead>
                    <TableHead className ="px-6 py-3">Etat</TableHead>
                    <TableHead className ="px-6 py-3">Date de création</TableHead>
                    <TableHead className ="px-6 py-3">Status</TableHead>
                    <TableHead className ="px-6 py=3">Propriétaire</TableHead>
                    <TableHead className ="px-6 py=3">Date de modification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className=" px-6 py-3font-medium">{process.name}</TableCell>
                      <TableCell className="px-6 py-3">{process.state}</TableCell>
                      <TableCell className="px-6 py-3" >{process.creationDate}</TableCell>
                      <TableCell className="px-6 py-3">{process.status}</TableCell>
                      <TableCell className="px-6 py-3">{process.owner}</TableCell>
                      <TableCell className="px-6 py-3">{process.modificationDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
        <div className="absolute left-[35%] w-max">
          {autoActv&&<FileAutoImportForm activeMethod={fileAutoImportWind}/>}
          {manActv && <FileImportManForm activeMethod={fileManImportWind}/>}
        </div>
        
      </div>
    </div>
  )
}
