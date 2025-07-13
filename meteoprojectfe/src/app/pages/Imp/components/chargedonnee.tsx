import { Button } from "@/components/ui/button";


interface Props{
    SetAutoActv:(value:boolean)=>void;
    SetManActv:(value:boolean)=>void;
}

export default function chargeDonnees({SetAutoActv,SetManActv}:Props){
    const ActiveAutoImportWind=()=>{
        SetAutoActv(true);
        SetManActv(false);
    }

    const ActiveManImportWind=()=>{
        SetManActv(true);
        SetAutoActv(false);
    }
    return(
        <div className="flex flex-col items-start gap-2">
            <h1 className="text-2xl font-semibold md:text-3xl">Charger les données</h1>
            <div className="flex gap-2">
              <Button onClick={ActiveManImportWind} variant="outline">Importer</Button>
              <Button onClick={ActiveAutoImportWind}>Auto</Button>
            </div>
        </div>
    );
}