#!/usr/bin/env bash

echo "🚀 Setting up Cursor MCP in devcontainer..."

# Ensure directories exist
mkdir -p /home/vscode/.config/cursor
mkdir -p /home/vscode/.cursor

# Set proper ownership for mounted directories
sudo chown -R vscode:vscode /home/vscode/.config/cursor 2>/dev/null || true
sudo chown -R vscode:vscode /home/vscode/.cursor 2>/dev/null || true
sudo chown -R vscode:vscode /home/vscode/.ssh 2>/dev/null || true

# Set up symlinks for global MCP access if needed
if [ -f "/home/vscode/.cursor/mcp.json" ]; then
    echo "🔗 MCP configuration found, creating symlinks..."
    ln -sf /home/vscode/.cursor/mcp.json /workspaces/ad-rag-mcp/.cursor-mcp.json 2>/dev/null || true
fi

# Create a script to easily run MCP commands
cat > /usr/local/bin/mcp << 'EOF'
#!/bin/bash
# Global MCP command wrapper for devcontainer
export CURSOR_USER_CONFIG_DIR=/home/vscode/.config/cursor
export CURSOR_GLOBAL_CONFIG_DIR=/home/vscode/.cursor
exec "$@"
EOF

chmod +x /usr/local/bin/mcp

echo "✅ Cursor MCP setup completed in devcontainer!"
echo "📍 MCP settings are now available at:"
echo "   - User config: /home/vscode/.config/cursor"
echo "   - Global config: /home/vscode/.cursor" 