import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

function CommonFormFields({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-nom`}>Nom</Label>
        <Input id={`${idPrefix}-nom`} placeholder="Nom" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea id={`${idPrefix}-description`} placeholder="Description" />
      </div>
    </>
  )
}

interface Props {
  activeMethod: (value: boolean) => void
}

export function FileAutoImportForm({ activeMethod }: Props) {
  const [importType, setImportType] = useState("automatique")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Exporter les Données</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-4">
          <CommonFormFields idPrefix="export" />

          {/* Type d'importation */}
          <div className="grid gap-2">
            <Label htmlFor="type-importation">Type d importation</Label>
            <Select defaultValue="automatique" onValueChange={setImportType}>
              <SelectTrigger id="type-importation">
                <SelectValue placeholder="Sélectionner le type d'importation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatique">Automatique</SelectItem>
                <SelectItem value="manuelle">Manuelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bloc fichier pour importation manuelle */}
          {importType === "manuelle" && (
            <div className="grid gap-2">
              <Label htmlFor="fichier-manuel">Fichier</Label>
              <div className="flex items-center gap-2">
                <Input id="fichier-manuel" type="file" onChange={handleFileChange} />
                <Button
                  type="button"
                  disabled={!selectedFile}
                  onClick={() => alert(`Import de : ${selectedFile?.name}`)}
                >
                  Importer
                </Button>
              </div>
            </div>
          )}

          {/* Type de fichier */}
          <div className="grid gap-2">
            <Label htmlFor="type-fichier">Type fichier</Label>
            <Select defaultValue="fichier-metadonnees">
              <SelectTrigger id="type-fichier">
                <SelectValue placeholder="Sélectionner le type de fichier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fichier-metadonnees">Fichier et Metadonnées</SelectItem>
                <SelectItem value="fichier-seul">Fichier seul</SelectItem>
                <SelectItem value="metadonnees-seules">Metadonnées seules</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section Avancée */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base">Section Avancée</AccordionTrigger>
            <AccordionContent className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="champs-export">Champs</Label>
                <Input id="champs-export" placeholder="Champs à exporter" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nbr-lignes-export">Nbr de lignes</Label>
                <Input id="nbr-lignes-export" type="number" placeholder="Nombre de lignes" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fichier-sortie">Fichier de sortie</Label>
                <Input id="fichier-sortie" placeholder="Nom du fichier de sortie" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="telecharger-resources" />
                <Label htmlFor="telecharger-resources">Télécharger les ressources</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Boutons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => activeMethod(false)} variant="outline">Annuler</Button>
          <Button onClick={() => activeMethod(true)}>Ok</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default FileAutoImportForm;
