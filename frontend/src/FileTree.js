import React, { useState, useEffect } from 'react';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { ChonkyActions, FileBrowser, FileNavbar, FileToolbar, FileList, FileContextMenu } from 'chonky';
import { setChonkyDefaults } from 'chonky';
import axios from 'axios';

//const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000';
const apiEndpoint = 'http://localhost:3000';

setChonkyDefaults({ iconComponent: ChonkyIconFA });

function FileTree() {
    const [files, setFiles] = useState([]);
    const [folderPrefix, setFolderPrefix] = useState('');

    useEffect(() => {
        fetchFiles(folderPrefix);
    }, [folderPrefix]);

    const folderChain = React.useMemo(() => {
        let folderChain: FileArray;
        if (folderPrefix === '') {
            folderChain = [];
        } else {
            let currentPrefix = '';
            folderChain = folderPrefix
                .replace(/\/*$/, '')
                .split('/')
                .map(
                    (prefixPart): FileData => {
                        currentPrefix = currentPrefix
                            ? (currentPrefix + '/' + prefixPart)
                            : prefixPart;
                        return {
                            id: currentPrefix,
                            name: prefixPart,
                            isDir: true,
                        };
                    }
                );
        }
        folderChain.unshift({
            id: '/',
            name: 'root',
            isDir: true,
        });
        return folderChain;
    }, [folderPrefix]);

    const fetchFiles = async (prefix) => {
        const response = await fetch(`${apiEndpoint}/list/${encodeURIComponent(prefix)}`);
        const data = await response.json();
        setFiles(data);
    };

    const handleFileAction = (action) => {
        if (action.id === ChonkyActions.OpenFiles.id) {
            console.log('handleFileAction: Got the OpenFile action');
            var file = undefined;
            if (action.state.selectedFilesForAction && action.state.selectedFilesForAction.length > 0) {
                file = action.state.selectedFilesForAction[0];
            } else if (action.payload.targetFile) { 
                file = action.payload.targetFile;
            } else {
                console.log('handleFileAction: ERROR not sure how we got here');
            }
            if (file.isDir) {
                setFolderPrefix(file.id);
            }
        } else if (action.id === ChonkyActions.DownloadFiles.id) {
            const file = action.state.selectedFilesForAction[0];
            window.open(`${apiEndpoint}/download/${encodeURIComponent(file.id)}`);
        } else {
            console.log('handleFileAction: unknown action id ' + action.id)
        }
    };

    const fileActions = React.useMemo(
        () => [
            ChonkyActions.DownloadFiles, // Adds a button
        ],
        []
    );

    return (
        <div>
            <FileBrowser files={files} fileActions={fileActions} onFileAction={handleFileAction} folderChain={folderChain}>
                <FileNavbar />
                <FileToolbar />
                <FileList />
                <FileContextMenu />
            </FileBrowser>
      </div>
  );
}

export default FileTree;
