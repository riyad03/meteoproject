from manualImportFile import _uploadFile
import time
from manualImportFile import Process
from typing import Dict, Any
from fastapi import UploadFile, File, HTTPException
from metadata_check import validate_wcmp2_json #,validate_wcmp2_xml


path_for_wcmp_schema="wcmp2-bundled.json"
async def startImport(data: Dict[str, Any],fileMetadata:UploadFile = File(...),file: UploadFile = File(...)):
    try:
        
        
        
        if( await validate_wcmp2_json(path_for_wcmp_schema,fileMetadata)):
            process = Process(
                name=data.get("name"),
                description=data.get("description"),
                import_type=data.get("import_type", "Fichier et Metadonnées"),
                fields=data.get("fields"),
                number_of_lines=data.get("number_of_lines"),
                input_filename=data.get("input_filename"),
                output_filename=data.get("output_filename"),
                metafile=fileMetadata,
                upload_file=file
            )
            print("Le fichier respecte le format WCMP2")
            return await process.start()
        else:
            print("Le fichier ne respecte pas le format WCMP2")
            return HTTPException(status_code=400, detail=f"Le fichier ne respecte pas WCMP2") 
        
    except Exception as e:
        print(f"Error: {e}")
        raise
  



