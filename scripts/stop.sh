#!/bin/bash

# Script pour arrêter les services ACV
# Usage: ./scripts/stop.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_DIR/.pids"

echo "🛑 Arrêt des services Nkwa Vault..."
echo "=" | head -c 30 && echo ""

# Lire les PIDs depuis le fichier
if [ -f "$PID_FILE" ]; then
    PIDS=$(cat "$PID_FILE")
    echo "📋 PIDs trouvés: $PIDS"
    
    for PID in $PIDS; do
        if kill -0 "$PID" 2>/dev/null; then
            echo "🔄 Arrêt du processus $PID..."
            kill "$PID"
            sleep 2
            
            # Vérifier si le processus est toujours actif
            if kill -0 "$PID" 2>/dev/null; then
                echo "⚠️  Force kill du processus $PID..."
                kill -9 "$PID" 2>/dev/null || true
            fi
            echo "✅ Processus $PID arrêté"
        else
            echo "ℹ️  Processus $PID déjà arrêté"
        fi
    done
    
    # Supprimer le fichier PID
    rm -f "$PID_FILE"
    echo "🗑️  Fichier PID supprimé"
else
    echo "ℹ️  Aucun fichier PID trouvé"
fi

# Arrêter tous les processus Node.js liés au projet
echo "🔄 Recherche de processus Node.js liés au projet..."
NODE_PIDS=$(pgrep -f "node.*ACV_project_starter" || true)

if [ -n "$NODE_PIDS" ]; then
    echo "📋 Processus Node.js trouvés: $NODE_PIDS"
    for PID in $NODE_PIDS; do
        echo "🔄 Arrêt du processus Node.js $PID..."
        kill "$PID" 2>/dev/null || true
    done
    echo "✅ Processus Node.js arrêtés"
else
    echo "ℹ️  Aucun processus Node.js lié au projet trouvé"
fi

# Arrêter les processus sur les ports 3000 et 4000
echo "🔄 Vérification des ports 3000 et 4000..."

for PORT in 3000 4000; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
        echo "🔄 Arrêt du processus sur le port $PORT (PID: $PID)..."
        kill "$PID" 2>/dev/null || true
        sleep 1
        
        # Vérifier si le port est toujours utilisé
        if lsof -ti:$PORT >/dev/null 2>&1; then
            echo "⚠️  Force kill du processus sur le port $PORT..."
            kill -9 "$PID" 2>/dev/null || true
        fi
        echo "✅ Port $PORT libéré"
    else
        echo "ℹ️  Port $PORT libre"
    fi
done

echo ""
echo "✅ Tous les services Nkwa Vault ont été arrêtés"
echo "🔄 Pour redémarrer: ./scripts/deploy.sh"
