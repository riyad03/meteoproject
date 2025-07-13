
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CommonFormFields } from "./common-form-fields"
import { Button } from "@/components/ui/button"


interface Props{
  activeMethod:(value:boolean)=>void
}
export function FileAutoImportForm({activeMethod}:Props) {
  return (
    <Card className="w-[500px] ">
      <CardHeader>
        <CardTitle>Exporter les Données</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CommonFormFields idPrefix="export" />

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
                <Label htmlFor="telecharger-resources">Telechager les resources</Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={()=>{activeMethod(false)}}  variant="outline">Annuler</Button>
          <Button onClick={()=>{activeMethod(true)}} >Ok</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default FileAutoImportForm;