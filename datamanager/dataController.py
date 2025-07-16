from manualImportFile import _uploadFile
import time
from manualImportFile import Process
from typing import Dict, Any
from fastapi import UploadFile, File


async def startImport(data: Dict[str, Any],file: UploadFile = File(...)):
    try:
        
        process = Process(
            name=data.get("name"),
            description=data.get("description"),
            import_type=data.get("import_type", "Fichier et Metadonnées"),
            fields=data.get("fields"),
            number_of_lines=data.get("number_of_lines"),
            input_filename=data.get("input_filename"),
            output_filename=data.get("output_filename"),
            upload_file=file
        )
        
        return await process._startUploadThread()
        #process._importFile()
        #return process
    except Exception as e:
        print(f"Error: {e}")
        raise
  



