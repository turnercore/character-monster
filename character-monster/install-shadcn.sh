#!/bin/bash

# Create directories and files
mkdir -p ./components/ui
mkdir -p ./tools
touch ./tools/utils.ts
mkdir -p ./styles

# Check for globals.css file and move or create it
if [ -f "app/globals.css" ]; then
    mv app/globals.css ./styles/globals.css
    # Check if ./app/layout.tsx exists before updating
    echo "Moved globals.css to ./styles/globals.css. Remember to update your globals.css import!"
else
    touch ./styles/globals.css
fi

# Run shadcn-ui init command (user interaction required)
echo "Init shadcn? (y/n)"
read -r -p "[Y/n]: " response
response=${response:-y}
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
echo "Running 'npx shadcn-ui@latest init'..."
echo "Please complete the interactive setup."
echo "Remember to use ./styles/globals.css for the global styles and @/tools/utils for the utils file."
npx shadcn-ui@latest init

# Confirmation message
read -p "Press enter once the interactive setup is complete..."
else 
echo "Skipping shadcn-ui init..."
fi

# Install shadcn-ui components
echo "Would you like to install all shadcn components @latest? (y/n)"
read -r -p "[Y/n]: " response
response=${response:-y}
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
components=(
    "accordion" "alert" "alert-dialog" "aspect-ratio" "avatar" "badge"
    "button" "calendar" "card" "checkbox" "collapsible" "combobox"
    "command" "context-menu" "data-table" "date-picker" "dialog" "dropdown-menu"
    "form" "hover-card" "input" "label" "menubar" "navigation-menu"
    "popover" "progress" "radio-group" "scroll-area" "select" "separator"
    "sheet" "skeleton" "slider" "switch" "table" "tabs"
    "textarea" "toast" "toggle" "toggle-group" "tooltip" "carousel" "drawer" "pagination"
    "resizable" "sonner" 
)

for component in "${components[@]}"; do
    echo "Installing $component..."
    yes | npx shadcn-ui@latest add "$component"
echo "Shad components installed successfully!"
done
else 
    echo "Skipping shadcn-ui component installation..."
fi

# Create index file if the user wants to
echo "Would you like to create an index file for your components? (y/n)"
read -r -p "[Y/n]: " response
response=${response:-y}
if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
# Install ts-node if not already installed
    if ! command -v ts-node &> /dev/null
    then
        echo "Installing ts-node..."
        npm install ts-node
    fi

    # Download the TypeScript file from the Gist
    echo "Downloading the setup-index.ts script..."
    curl -o setup-index.mjs "https://gist.githubusercontent.com/turnercore/37b3b634e9e401bcf96414daa14b7453/raw/2a6baadffb97b8f89d03f51e665e4ca497343942/generateIndex.ts"

    # Run the script with ts-node
    echo "Running the setup-index.mjs script..."
    npx ts-node setup-index.mjs

    # Delete the setup-index.ts file after running
    echo "Deleting the setup-index.ts script..."
    rm setup-index.mjs

    echo "Index file creation complete."
else 
    echo "Skipping index.ts generation..."
fi

echo "Shadcn install complete!"
