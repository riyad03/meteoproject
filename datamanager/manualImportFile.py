# Importation des bibliothèques nécessaires
import os           # Pour gérer les chemins, vérifier si un fichier existe, etc.
import shutil       # Pour copier des fichiers (simule l’upload)
import netCDF4      # Pour lire les fichiers NetCDF (.nc)
import h5py  
import threading
import os
from fastapi import UploadFile,File

# Définir le nom du dossier où les fichiers seront copiés (uploadés)
UPLOAD_DIR = "uploads"


# Si le dossier "uploads" n'existe pas, on le crée automatiquement
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class CopierAvecProgression:
    def __init__(self, src, dst, buffer_size=1024*1024,progress_callback=None):
        self.src = src
        self.dst = dst
        self.buffer_size = buffer_size
        self.total_size = os.path.getsize(src)
        self.copied = 0
        self.loading_progress = 0  # Progression en %
        self.progress_callback=progress_callback

    def getLoadingProgress(self):
        return self.loading_progress
    def copy(self):
        with open(self.src, 'rb') as fsrc, open(self.dst, 'wb') as fdst:
            while True:
                buf = fsrc.read(self.buffer_size)
                if not buf:
                    break
                fdst.write(buf)
                self.copied += len(buf)
                self.loading_progress = self.copied * 100 / self.total_size
                if(self.progress_callback):
                    self.progress_callback(self.loading_progress)
                print(f"\rCopié {self.copied}/{self.total_size} bytes ({self.loading_progress:.2f}%)", end='', flush=True)
        print("\nCopie terminée.")
    
    

class ImportTask:
    def __init__(self, src_path,dest_path=None,  buffer_size=1024*1024,upload_dir="uploads", upload_file: UploadFile = None):
        self.src_path = src_path
        self.buffer_size = buffer_size
        self.dst_path=dest_path
        self.upload_dir=upload_dir
        self.progress = 0.0  # en pourcentage
        self.status = "ready"  # ready, running, done, error
        self.error = None
        self._lock = threading.Lock()
        self._thread = None
        self.upload_file=upload_file

        # Crée le dossier upload s'il n'existe pas
        if dest_path!=None:
            os.makedirs(os.path.dirname(self.dst_path),exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        

    def start(self):
        self.status = "running"
        self._thread = threading.Thread(target=self.upload_from_fastapi,args=(self.dst_path))
        self._thread.start()

    def _run(self):
        try:
            self.dst_path = os.path.join(self.upload_dir, os.path.basename(self.src_path))
            cp=CopierAvecProgression(self.src_path,self.dst_path,self.buffer_size,progress_callback=self.update_progress)
            cp.copy()
            
            self.status = "done"
        except Exception as e:
            self.status = "error"
            self.error = e
            
    
    def upload_from_fastapi(self,destination_name, file: UploadFile):
        """Upload un fichier depuis FastAPI UploadFile"""
        try:
            self.status = "running"
            dest_name = destination_name or file.filename
            self.dst_path = os.path.join(self.upload_dir, dest_name)
            
            total_size = 0
            # Essayer d'obtenir la taille du fichier
            try:
                file.file.seek(0, 2)  # Aller à la fin
                total_size = file.file.tell()
                file.file.seek(0)  # Revenir au début
            except:
                total_size = 0
            
            with open(self.dst_path, "wb") as dest_file:
                uploaded_size = 0
                while True:
                    chunk = file.file.read(self.buffer_size)
                    if not chunk:
                        break
                    
                    dest_file.write(chunk)
                    uploaded_size += len(chunk)
                    
                    # Calculer le progrès
                    if total_size > 0:
                        self.progress = (uploaded_size / total_size) * 100
                    
            self.status = "done"
            return self.dst_path
            
        except Exception as e:
            self.status = "error"
            self.error = e
            raise e

    def is_done(self):
        return self.status in ("done", "error")
    
    def get_status(self):
        return self.status

    def join(self):
        self._thread.join()

    def update_progress(self,progress):
       
        self.progress = progress
        
       
    def get_progress(self):
        return self.progress

    def get_result(self):
        if self.status == "done":
            return self.dst_path
        elif self.status == "error":
            raise self.error
        else:
            return None
        
class Process():
   

    def __init__(self,name,description,import_type,fields,number_of_lines,input_filename,output_filename,upload_file:UploadFile=File(...)):
        self.name=name
        self.description=description
        self.import_type=import_type
        self.fields=fields
        self.number_of_lines=number_of_lines
        self.input_filename=input_filename
        self.output_filename=output_filename
        self.file=upload_file
        self.UPLOAD_DIR="uploads"

    
    async def _startUploadThread(self):
        file_location = os.path.join(self.UPLOAD_DIR, self.file.filename)
        with open(file_location, "wb") as f:
            while chunk := await self.file.read(1024 * 1024):  # lire par chunks de 1MB
                f.write(chunk)

        return {"filename": self.file.filename, "message": "Upload terminé, traitement lancé en arrière-plan"}
    
    def _getStatus(self):
        return self.importThread.get_status()


    def to_dict(self):
        """Méthode to_dict manquante - à implémenter selon vos besoins"""
        return {
            "name": self.name,
            "description": self.description,
            "import_type": self.import_type,
            "fields": self.fields,
            "number_of_lines": self.number_of_lines,
            "input_filename": self.input_filename,
            "output_filename": self.output_filename
        }


async def _uploadFile(UPLOAD_DIR,file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # lire par chunks de 1MB
            f.write(chunk)

    return {"filename": file.filename, "message": "Upload terminé, traitement lancé en arrière-plan"}
    

    
    
    

# Définition d'une fonction qui lit un fichier et le copie dans le dossier "uploads"
def lire_fichier(chemin_fichier):

    # Vérifie que le chemin entré est bien un fichier
    if not os.path.isfile(chemin_fichier):
        print("❌ Chemin invalide ou ce n'est pas un fichier.")
        return  # Arrête la fonction si le fichier n’existe pas

    # Extraire l'extension du fichier (.nc, .h5, .a, etc.)
    extension = os.path.splitext(chemin_fichier)[1].lower()

    # 📘 Traitement des fichiers NetCDF
    if extension == ".nc":
        print(f"\n📘 Fichier NetCDF détecté : {chemin_fichier}")
        
        
        return netCDF4.Dataset(chemin_fichier, 'r')
        
       

    # 📘 Traitement des fichiers HDF5
    elif extension in [".h5", ".hdf5"]:
        print(f"\n📘 Fichier HDF5 détecté : {chemin_fichier}")
        return h5py.File(chemin_fichier, 'r')
        

    # 📘 Traitement des fichiers texte ASCII (.a ou .txt)
    elif extension == ".a" or extension == ".txt":
        print(f"\n📘 Fichier texte détecté : {chemin_fichier}")
        return open(chemin_fichier, 'r', encoding="utf-8", errors='ignore')
        '''
        # Ouvre le fichier texte en mode lecture
        with open(chemin_fichier, 'r', encoding="utf-8", errors='ignore') as f:
            contenu = f.read()  # Lit tout le contenu
            print("\n📄 Contenu du fichier (premiers 500 caractères) :")
            print(contenu[:500])  # Affiche les 500 premiers caractères
        '''

    else:
        # Si le type de fichier n’est pas reconnu
        print("❌ Format de fichier non supporté.")
        return

   

