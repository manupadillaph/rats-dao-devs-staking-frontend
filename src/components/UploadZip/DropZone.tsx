import React from "react";
import Image from "next/image";
import styles from "./DropZone.module.css";

//based in https://github.com/gisioraelvis/nextjs-dnd-fileupload-code

const DropZone = ({ dispatch }: {dispatch: React.Dispatch<{
                type: any;
                inDropZone?: any;
                file?: any;
            }>}) => {
    // onDragEnter sets inDropZone to true
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: true });
    };

    // onDragLeave sets inDropZone to false
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
    };

    // onDragOver sets inDropZone to true
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // set dropEffect to copy i.e copy of the source item
        e.dataTransfer.dropEffect = "copy";
        dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: true });
    };

    // onDrop sets inDropZone to false and adds files to fileList
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // get files from event on the dataTransfer object as an array
        let files = [...e.dataTransfer.files];

        files = files.filter((f) => f.name.endsWith(".zip"));

        // ensure a file or files are dropped
        if (files && files.length > 0) {
            dispatch({ type: "SET_FILE", file: files[0] }); 
            dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
        }
    };

    // handle file selection via input element
    const handleFileSelect = (e: any) => {
        // get files from event on the input element as an array
        let files = [...e.target.files];

        files = files.filter((f) => f.name.endsWith(".zip"));

        // ensure a file or files are selected
        if (files && files.length > 0) {

            // use if you want to replace the existing files with the new files
            dispatch({ type: "SET_FILE", file: files[0] }); 
        }
    };

    

    return (
        <>
            <div
                className={styles.dropzone}
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragOver(e)}
                onDragEnter={(e) => handleDragEnter(e)}
                onDragLeave={(e) => handleDragLeave(e)}
            >
                <Image src="/upload.svg" alt="upload" height={50} width={50} />

                <input
                    id="fileSelect"
                    type="file"
                    accept=".zip"
                    // multiple
                    className={styles.files}
                    onChange={(e) => handleFileSelect(e)}
                />
                <label htmlFor="fileSelect">select file</label>

                <p className={styles.uploadMessage}>
                    or drag &amp; drop your ZIP file here
                </p>
                
            </div>
         
        </>
    );
};

export default DropZone;