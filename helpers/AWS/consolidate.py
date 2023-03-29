import argparse
from zipfile import ZipFile, is_zipfile
import pandas
import os
import shutil
import random

TEMP_FOLDER = r"tempMerge"

def merge_zip(zip, temp_folder, created_files):
    if not is_zipfile(zip):
        print(f"{zip} is not a zip format, skipping...")
        return
    archive = ZipFile(zip, "r")
    files = archive.namelist()
    for file in files:
        csv = archive.open(file)
        new = pandas.read_csv(csv)
        csv.close()
        consolidate_file_name = os.path.join(temp_folder,csv.name.replace(":", "_"))
        
        if csv.name in created_files:
            temp = pandas.read_csv(consolidate_file_name)
            res = pandas.concat([temp,new], ignore_index=True)
            res.to_csv(consolidate_file_name, index=False)
            continue
        else:
            created_files.append(csv.name)
            new.to_csv(consolidate_file_name, index=False)
    archive.close()

def consolidate(folder):
    created_files = []
    zips = os.listdir(folder)
    zip_count = 1

    temp_folder = TEMP_FOLDER
    # Create temp folder to merge file
    if (os.path.exists(temp_folder)):
        temp_folder += str(random.randint(0,1000))
    os.makedirs(temp_folder)
    
    # Merge all zips into single files
    for zip in zips:
        print(f"Merging {zip_count}/{len(zips)}, current zip: {zip}")
        file_path = os.path.join(folder, zip)
        merge_zip(file_path, temp_folder, created_files)
        zip_count += 1

    # Create an archive of merged files
    archive = ZipFile("merged.zip", "w")
    for file in os.listdir(temp_folder):
        archive.write(os.path.join(temp_folder, file), file)
    archive.close()

    # Delete temporary files
    shutil.rmtree(temp_folder)

    print("Finished merging, merged file: merged.zip")

def parse_arguments():
    parser = argparse.ArgumentParser(description="Merges account information collected using AWXPX")
    parser.add_argument("folder", type=str, help="The where AWSPX output in ZIP formats are stored")
    args = parser.parse_args()
    return args

def main():
    args = parse_arguments()
    consolidate(args.folder)


if __name__ == "__main__":
    main()