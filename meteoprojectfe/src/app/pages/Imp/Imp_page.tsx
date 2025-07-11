import { Button } from "@/components/ui/button" //needs npx shadcn@latest add button
import { Input } from "@/components/ui/input" //needs npx shadcn@latest add Input
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" //needs npx shadcn@latest add table

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

  return (
    <div className="flex min-h-screen w-full">
    
     

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {/* Charger les données section */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold md:text-3xl">Charger les données</h1>
            <div className="flex gap-2">
              <Button variant="outline">Importer</Button>
              <Button>Auto</Button>
            </div>
          </div>

          {/* Récents section */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Récents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Filtrer
                </Button>
                <Input
                  type="search"
                  placeholder="Chercher"
                  className="w-full max-w-xs rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:focus:border-gray-400"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom Processus</TableHead>
                    <TableHead>Etat</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>Date de modification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{process.name}</TableCell>
                      <TableCell>{process.state}</TableCell>
                      <TableCell>{process.creationDate}</TableCell>
                      <TableCell>{process.status}</TableCell>
                      <TableCell>{process.owner}</TableCell>
                      <TableCell>{process.modificationDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
