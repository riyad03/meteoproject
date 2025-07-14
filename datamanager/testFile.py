# Importation des bibliothèques nécessaires
import os           # Pour gérer les chemins, vérifier si un fichier existe, etc.
import shutil       # Pour copier des fichiers (simule l’upload)
import netCDF4      # Pour lire les fichiers NetCDF (.nc)
import h5py         # Pour lire les fichiers HDF5 (.h5, .hdf5)

# Définir le nom du dossier où les fichiers seront copiés (uploadés)
UPLOAD_DIR = "uploads"

# Si le dossier "uploads" n'existe pas, on le crée automatiquement
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Définition d'une fonction qui lit un fichier et le copie dans le dossier "uploads"
def lire_et_uploader_fichier(chemin_fichier):

    # Vérifie que le chemin entré est bien un fichier
    if not os.path.isfile(chemin_fichier):
        print("❌ Chemin invalide ou ce n'est pas un fichier.")
        return  # Arrête la fonction si le fichier n’existe pas

    # Extraire l'extension du fichier (.nc, .h5, .a, etc.)
    extension = os.path.splitext(chemin_fichier)[1].lower()

    # 📘 Traitement des fichiers NetCDF
    if extension == ".nc":
        print(f"\n📘 Fichier NetCDF détecté : {chemin_fichier}")
        
        # Ouvre le fichier avec netCDF4 en lecture
        with netCDF4.Dataset(chemin_fichier, 'r') as nc:
            
            # Affiche les dimensions du fichier NetCDF
            print("\n📦 Dimensions :")
            for dim in nc.dimensions.items():
                print(f" - {dim[0]}: {len(dim[1])} éléments")

            # Affiche les variables contenues dans le fichier NetCDFz
            print("\n📊 Variables :")
            for var in nc.variables.items():
                print(f" - {var[0]} ({var[1].dimensions})")

            # Affiche un aperçu de la première variable (valeurs)
            print("\n📄 Aperçu d’une variable (si elle existe) :")
            if len(nc.variables) > 0:
                var_nom = list(nc.variables.keys())[0]
                print(f" → Première variable : {var_nom}")
                print(nc.variables[var_nom][:])  # Affiche toutes les valeurs

    # 📘 Traitement des fichiers HDF5
    elif extension in [".h5", ".hdf5"]:
        print(f"\n📘 Fichier HDF5 détecté : {chemin_fichier}")
        
        # Ouvre le fichier avec h5py en lecture
        with h5py.File(chemin_fichier, 'r') as hdf:
            print("\n📊 Contenu du fichier :")

            # Fonction pour explorer récursivement le contenu du fichier HDF5
            def explorer_hdf5(groupe, prefix=""):
                for nom in groupe:
                    item = groupe[nom]  # Récupère l'élément (dataset ou sous-groupe)
                    
                    # Si c'est un groupe (comme un dossier)
                    if isinstance(item, h5py.Group):
                        print(f"{prefix}{nom}/")
                        # Appel récursif pour explorer ce sous-groupe
                        explorer_hdf5(item, prefix + nom + "/")
                    else:
                        # Si c’est un dataset, on affiche sa forme et quelques valeurs
                        print(f"{prefix}{nom} : shape={item.shape}, dtype={item.dtype}")
                        print("Valeurs exemple :", item[()][:5] if item.size > 5 else item[()])

            # Lance l’exploration à partir de la racine du fichier HDF5
            explorer_hdf5(hdf)

    # 📘 Traitement des fichiers texte ASCII (.a ou .txt)
    elif extension == ".a" or extension == ".txt":
        print(f"\n📘 Fichier texte détecté : {chemin_fichier}")
        
        # Ouvre le fichier texte en mode lecture
        with open(chemin_fichier, 'r', encoding="utf-8", errors='ignore') as f:
            contenu = f.read()  # Lit tout le contenu
            print("\n📄 Contenu du fichier (premiers 500 caractères) :")
            print(contenu[:500])  # Affiche les 500 premiers caractères

    else:
        # Si le type de fichier n’est pas reconnu
        print("❌ Format de fichier non supporté.")
        return

    # 📤 Copier (uploader) le fichier dans le dossier "uploads"
    nom_fichier = os.path.basename(chemin_fichier)  # Récupère juste le nom du fichier
    destination = os.path.join(UPLOAD_DIR, nom_fichier)  # Chemin destination
    shutil.copy(chemin_fichier, destination)  # Copie du fichier
    print(f"\n✅ Fichier copié dans : {destination}")

# ➤ Demander à l’utilisateur d’entrer le chemin complet du fichier à traiter
chemin = "C:/Users/eloua/OneDrive/Bureau/TestFile/train.hdf5"

print("➡️ Chemin fourni :", chemin)
print("📄 Est-ce un fichier ? ", os.path.isfile(chemin))
print("📁 Existe-t-il ? ", os.path.exists(chemin))
# Appelle la fonction avec ce chemin donné
lire_et_uploader_fichier(chemin)
