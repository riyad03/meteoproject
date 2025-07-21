import { useState,useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const allowedExtensions = ["netcdf", "h5","hdf5","hdf"];
const allowedMetaDataExtensions = ["json"];

interface Props {
  activeMethod: (value: boolean) => void
}

export function FileAutoImportForm({ activeMethod }: Props) {
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [field,setField]=useState<string[]>([]);
  const [numberOfLine,setnumberOfLine]=useState(-1);
  const [outputFileName,setOutputFileName]=useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileJsonInputRef = useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<File|null>(null);
  const [metadataFile,setMetadataFile]=useState<File|null>(null);
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleMetaDataButtonClick = () => {
    fileJsonInputRef.current?.click();
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
        
      console.log(selectedfile.name);

        
    }
  };
  const handleMetaDataFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedfile = event.target.files?.[0];
    if (selectedfile) {
      const fileName=selectedfile.name;
      const extension = fileName.split('.').pop()?.toLowerCase();
      if(!extension||!allowedMetaDataExtensions.includes(extension) ){
        return null;
      }
      setMetadataFile(selectedfile);
        
      console.log(selectedfile.name);

        
    }
  };
  const uploadFile= async()=>{
    if (!file) {
      console.error("No file selected");
      return;
    }
    if(!metadataFile){
      console.error("No metadataFile selected");
      return;
    }
    const metadata = {
      name: name,
      description: description,
      import_type: "CSV",
      fields: field,
      number_of_lines: numberOfLine,
      input_filename: file.name,
      output_filename: outputFileName,
    };
     
    const formData=new FormData();
    formData.append("file",file);
    formData.append("fileMetdata",metadataFile);
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
  const [importType, setImportType] = useState("automatique")
 

  

  return (
  
      
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Importer les Données</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-4">
            {/*<CommonFormFields idPrefix="export" />*/}
            
            <div className="grid gap-2">
                <Label >Nom</Label>
                <Input id={`nom`} placeholder="Nom" onChange={(e)=>setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`description`}>Description</Label>
                <Textarea id={`description`} placeholder="Description" onChange={(e)=>setDescription(e.target.value)} />
            </div>
            
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
                  <div>
                    <Label htmlFor="fichier-manuel">Meta données</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="fichier-name">{metadataFile?.name}</Label>
                      <Input 
                        className="hidden"
                        type="file"
                        ref={fileJsonInputRef}
                        accept=".json"
                        onChange={handleMetaDataFileChange}
                      />
                      
                      <Button
                        type="button"
                        onClick={handleMetaDataButtonClick}
                      >
                        Importer
                      </Button>
                    </div> 
                  </div>
                  
                  <div>
                    <Label htmlFor="fichier-manuel">Fichier</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="fichier-name">{file?.name}</Label>
                      <Input 
                        className="hidden"
                        type="file"
                        ref={fileInputRef}
                        accept=".netcdf,.h5,.hdf5,.hdf"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        onClick={handleButtonClick}
                      >
                        Importer
                      </Button>
                    </div> 
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
                  <Label htmlFor="champs-export" >Champs</Label>
                  <Input id="champs-export" placeholder="Champs à exporter" onChange={(e)=>{setField(e.target.value.split(',').map(e=>e.trim()))}} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nbr-lignes-export">Nbr de lignes</Label>
                  <Input id="nbr-lignes-export" type="number" placeholder="Nombre de lignes" onChange={(e)=>{setnumberOfLine( Number(e.target.value))}}/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fichier-sortie">Fichier de sortie</Label>
                  <Input id="fichier-sortie" onChange={(e)=>setOutputFileName(e.target.value)} placeholder="Nom du fichier de sortie" />
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
            <Button onClick={uploadFile}>Ok</Button>
          </div>
        </CardContent>
      </Card>
    
  )
}

export default FileAutoImportForm;
