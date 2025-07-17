"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CommonFormFields } from "./common-form-fields"
import { useState, useRef } from "react";


const allowedExtensions = ["netcdf", "h5","hdf5","hdf"];

interface Prop{
  activeMethod:(value:boolean)=>void;
}
export  function FileImportManForm({activeMethod}:Prop) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<File|null>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedfile = event.target.files?.[0];
    if (selectedfile) {
      const fileName=selectedfile.name;
      const extension = fileName.split('.').pop()?.toLowerCase();
      if(!extension||!allowedExtensions.includes(extension) ){
        return null;
      }
      setFile(selectedfile);
      
      console.log(file?.name);
      
    }
  };
  const uploadFile= async()=>{
    if (!file) {
      console.error("No file selected");
      return;
    }
    const metadata = {
      name: "test",
      description: "Import customer data from CSV file",
      import_type: "CSV",
      fields: "name",
      number_of_lines: 1500,
      input_filename: file.name,
      output_filename: "processed_customers.csv",
    };
   
    const formData=new FormData();
    formData.append("file",file);
    formData.append("metadata",JSON.stringify(metadata));
    
    try{
      const res = await fetch("http://localhost:8081/datamanager/process/dict/",
        {
          method:"Post",
          body:formData
        }
      );
      const result=await res;
      console.log(result);
    }
    catch(e){
      console.log("Error uploading file:",e);
    }
    // \"description\": \"Import customer data from CSV file\", \"import_type\": \"CSV\", \"fields\": \"name\",, \"number_of_lines\": 1500, \"input_filename\": \"requirements.txt\", \"output_filename\": \"processed_customers.csv\"}
    
  }
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
            <Input
              id="fichier"
              type="text"
              placeholder="Aucun fichier sélectionné"
              value={file?.name}
              readOnly
            />
            <Button type="button" onClick={handleButtonClick}>
              Importer
            </Button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".netcdf,.h5,.hdf5,.hdf"
              onChange={handleFileChange}
            />
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
          <Button onClick={uploadFile}>Ok</Button>
        </div>
      </CardContent>
    </Card>
  )
}
export default FileImportManForm;