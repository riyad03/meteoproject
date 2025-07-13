"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CommonFormFields } from "./common-form-fields"


interface Prop{
  activeMethod:(value:boolean)=>void;
}
export  function FileImportManForm({activeMethod}:Prop) {
  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Importer un Fichier</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CommonFormFields idPrefix="import" />

        <div className="grid gap-2">
          <Label htmlFor="fichier">Fichier</Label>
          <div className="flex items-center gap-2">
            <Input id="fichier" type="text" placeholder="Aucun fichier sélectionné" readOnly />
            <Button type="button">Importer</Button>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base">Section Avancée</AccordionTrigger>
            <AccordionContent className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="champs-import">Champs</Label>
                <Input id="champs-import" placeholder="Champs du fichier" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nbr-lignes-import">Nbr de lignes</Label>
                <Input id="nbr-lignes-import" type="number" placeholder="Nombre de lignes" />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={()=>activeMethod(false)} variant="outline">Annuler</Button>
          <Button>Ok</Button>
        </div>
      </CardContent>
    </Card>
  )
}
export default FileImportManForm;