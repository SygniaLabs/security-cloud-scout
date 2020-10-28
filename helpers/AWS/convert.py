import os
import pandas as pd
import excel2json
import json
from zipfile import ZipFile
import shutil
import argparse

def create_zip_from_dir(dir_path):
    current_path = os.getcwd()
    os.chdir(dir_path)
    
    output_folder = os.path.dirname(current_path)
    zip_filename = os.path.join(current_path, 'AWS_BHC.zip')
    print("Saving file to {}".format(zip_filename))
    
    # create a ZipFile object
    with ZipFile(zip_filename, 'w') as zipObj:
       # Iterate over all the files in directory
       for folderName, subfolders, filenames in os.walk(dir_path):
           for filename in filenames:
               # Add file to zip
               zipObj.write(filename)
   
    os.chdir(current_path)
    return zip_filename
           
           
def convert_csvs_to_json(folder_path):
    # Convert CSV to XLSX
    csv_files = os.listdir(folder_path)
    for file in csv_files:
        file_path = os.path.join(folder_path, file)
        read_file = pd.read_csv(file_path)
        read_file.to_excel(file_path+'.xlsx', index=None, header=True)
        os.remove(file_path)

    # Convert XLSX to JSON
    xlsx_files = os.listdir(folder_path)
    for file in xlsx_files:
        file_path = os.path.join(folder_path, file)
        excel2json.convert_from_file(file_path)
        os.rename(os.path.join(folder_path, 'Sheet1.json'), file_path+'.json')
        os.remove(file_path)
        
def add_meta(file):
    with open(file, 'rb') as rf:
        data = json.load(rf)
    
    name = os.path.basename(file)
    
    if name[:3] == 'AWS':
        type = 'AWSNode'
    else:
        type = 'AWSEdge'
    
    new_data = json.dumps({type: data, 'meta': {"type": type, "count": len(data), "version": "3"}})
    
    with open(file, 'wb') as wf:
        wf.write(bytes(new_data, 'utf-8'))
        

def edit_json_meta(folder_path):
    json_files = os.listdir(folder_path)
    # Add meta information for each file
    for file in json_files:
        file_path = os.path.join(folder_path, file)
        add_meta(file_path)
    
    # Zip files
    return create_zip_from_dir(folder_path)
    
def convert_awspx_to_bhcloud(zip_file_path):
    print("Converting files..")
    # Extract files from zip
    base_dir = os.path.dirname(zip_file_path)
    
    output_dir = os.path.join(base_dir, 'temp')
    with ZipFile(zip_file_path, 'r') as zipObj:
        zipObj.extractall(output_dir)
    
    print("Convert files to JSON")
    # Convert CSVs to JSON
    convert_csvs_to_json(output_dir)
    
    print("Zip converted files")
    # Edit necessary meta data to files
    new_zip_file = edit_json_meta(output_dir)

    # shutil.rmtree(output_dir)
    print("Done! new file created: {}".format(new_zip_file))
    
def main():
    parser = argparse.ArgumentParser(description="Some description")
    parser.add_argument('path', help='Path of awspx zip file')
    args = parser.parse_args()

    if (not os.path.isfile(args.path)):
        print("Error: File not found")
        return
    
    convert_awspx_to_bhcloud(args.path)
    
if __name__ == "__main__":
    main()