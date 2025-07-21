from fastapi import File, HTTPException,UploadFile
import io
import h5py
from netCDF4 import Dataset
import json
from jsonschema import validate, ValidationError, SchemaError
#import xmlschema

class metadata_checker():


    async def read_metadata(self,file: UploadFile = File(...)):
        peek_size = 10 * 1024 * 1024
        partial_content=await file.read(peek_size)
        buffer=io.BytesIO(partial_content)
        required_fields = [
            "title",
            "summary",
            "keywords",
            "geospatial_lat_min", "geospatial_lat_max",
            "geospatial_lon_min", "geospatial_lon_max",
            "time_coverage_start", "time_coverage_end",
            "creator_name", "creator_email",
            "publisher_name", "publisher_email",
        ]
        try:
            metadata={}
            filename = file.filename.lower()
            if filename.endswith(".h5") or filename.endswith(".hf5"):
                with h5py.File(buffer,"r") as f:
                    metadata={key: f.attrs[key] for key in f.attrs.keys()}
            elif filename.endswith(".nc"):
                with Dataset(buffer, "r") as ds:
                    metadata = {key: ds.getncattr(key) for key in ds.ncattrs()}
            has_wcmp2 = (
                any("wcmp2" in str(v).lower() for v in metadata.values()) or
                ("Conventions" in metadata and "wcmp2" in metadata["Conventions"].lower())
            )

           
            print("has_wcmp2 ",has_wcmp2)
            # Check if all required WCMP2 fields exist
            has_all_fields = all(field in metadata for field in required_fields)
            return has_wcmp2 and has_all_fields
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erreur de lecture de metadonne: {str(e)}")
        return True
    import json
from jsonschema import validate, ValidationError, SchemaError



async def validate_wcmp2_json(schema_path,file:UploadFile=File(...)):
    context= await file.read()

    try:
        json_data= json.loads(context.decode('utf-8'))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid Json: {e}")

    # Load the JSON schema
    with open(schema_path, 'r', encoding='utf-8') as schema_file:
        schema = json.load(schema_file)

    # Validate the data against the schema
    try:
        validate(instance=json_data, schema=schema)
        return True
    except ValidationError as e:
        print(f"Validation failed: {e.message}")
        
    except SchemaError as e:
        print(f"Schema error: {e.message}")
        

'''
async def validate_wcmp2_xml( xsd_path,file:UploadFile=File(...)):
    context= await file.read()
    xml_string = context.decode('utf-8')
    schema=xmlschema.XMLSchema(xsd_path)
    is_valid = schema.is_valid(xml_string)
    if not is_valid:
        schema.validate(xml_string)
    return True
'''