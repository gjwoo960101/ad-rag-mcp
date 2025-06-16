#!/usr/bin/env bash

# DevContainer Arguments
localWorkspaceFolder=$1  
containerWorkspaceFolder=$2 
localWorkspaceFolderBasename=$3   
containerWorkspaceFolderBasename=$4   

# Create env for docker-compose 
cat > .devcontainer/.env <<EOL

# Original DevContainer Arguments
localWorkspaceFolder = $localWorkspaceFolder
containerWorkspaceFolder = $containerWorkspaceFolder
localWorkspaceFolderBasename =  $localWorkspaceFolderBasename
containerWorkspaceFolderBasename = $containerWorkspaceFolderBasename 

# Cursor MCP Configuration
CURSOR_USER_CONFIG_DIR=/home/vscode/.config/cursor
CURSOR_GLOBAL_CONFIG_DIR=/home/vscode/.cursor

EOL

echo "🔧 DevContainer initialization completed with MCP support!"