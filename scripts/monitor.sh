#!/bin/bash

# Script de monitoring pour Nkwa Vault
# Usage: ./scripts/monitor.sh [start|stop|status|logs]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/monitor.log"
PID_FILE="$PROJECT_DIR/.monitor.pid"

# Créer le répertoire de logs
mkdir -p "$PROJECT_DIR/logs"

# Fonction pour logger
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction pour vérifier la santé de l'application
check_health() {
    local url="http://localhost:4000/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "200" ]; then
        log "✅ Application healthy (HTTP $response)"
        return 0
    else
        log "❌ Application unhealthy (HTTP $response)"
        return 1
    fi
}

# Fonction pour vérifier les ressources système
check_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
    
    log "📊 CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%"
    
    # Alertes si les ressources sont élevées
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log "⚠️  CPU usage élevé: ${cpu_usage}%"
    fi
    
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        log "⚠️  Memory usage élevé: ${memory_usage}%"
    fi
    
    if [ "$disk_usage" -gt 80 ]; then
        log "⚠️  Disk usage élevé: ${disk_usage}%"
    fi
}

# Fonction pour vérifier les processus
check_processes() {
    local node_processes=$(pgrep -f "node.*server.js" | wc -l)
    local react_processes=$(pgrep -f "react-scripts" | wc -l)
    
    log "🔄 Processus: Node.js ($node_processes), React ($react_processes)"
    
    if [ "$node_processes" -eq 0 ]; then
        log "❌ Aucun processus Node.js trouvé"
        return 1
    fi
    
    if [ "$react_processes" -eq 0 ]; then
        log "⚠️  Aucun processus React trouvé"
    fi
}

# Fonction pour vérifier les ports
check_ports() {
    local port_3000=$(lsof -i :3000 | wc -l)
    local port_4000=$(lsof -i :4000 | wc -l)
    
    log "🔌 Ports: 3000 ($port_3000), 4000 ($port_4000)"
    
    if [ "$port_4000" -eq 0 ]; then
        log "❌ Port 4000 (backend) non utilisé"
        return 1
    fi
}

# Fonction pour redémarrer l'application
restart_app() {
    log "🔄 Redémarrage de l'application..."
    
    # Arrêter les processus existants
    pkill -f "node.*server.js" || true
    pkill -f "react-scripts" || true
    sleep 2
    
    # Redémarrer
    cd "$PROJECT_DIR"
    ./scripts/deploy.sh &
    
    log "✅ Application redémarrée"
}

# Fonction de monitoring en continu
start_monitoring() {
    log "🚀 Démarrage du monitoring Nkwa Vault"
    
    # Vérifier si déjà en cours
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log "⚠️  Monitoring déjà en cours (PID: $pid)"
            return 1
        fi
    fi
    
    # Démarrer le monitoring en arrière-plan
    (
        while true; do
            log "🔍 Vérification de l'état de l'application..."
            
            # Vérifications
            check_health
            health_status=$?
            
            check_resources
            check_processes
            check_ports
            
            # Si l'application n'est pas saine, redémarrer
            if [ $health_status -ne 0 ]; then
                log "🔄 Application non saine, redémarrage..."
                restart_app
                sleep 30
            else
                log "✅ Application saine"
            fi
            
            # Attendre avant la prochaine vérification
            sleep 60
        done
    ) &
    
    local monitor_pid=$!
    echo $monitor_pid > "$PID_FILE"
    log "✅ Monitoring démarré (PID: $monitor_pid)"
}

# Fonction pour arrêter le monitoring
stop_monitoring() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            kill "$pid"
            log "✅ Monitoring arrêté (PID: $pid)"
        else
            log "⚠️  Processus de monitoring non trouvé"
        fi
        rm -f "$PID_FILE"
    else
        log "⚠️  Aucun fichier PID trouvé"
    fi
}

# Fonction pour afficher le statut
show_status() {
    log "📊 Statut de Nkwa Vault"
    echo "=" | head -c 50 && echo ""
    
    # Vérifier la santé
    if check_health; then
        echo "✅ Application: En ligne"
    else
        echo "❌ Application: Hors ligne"
    fi
    
    # Vérifier les processus
    check_processes
    
    # Vérifier les ports
    check_ports
    
    # Vérifier les ressources
    check_resources
    
    # Vérifier le monitoring
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "✅ Monitoring: Actif (PID: $pid)"
        else
            echo "❌ Monitoring: Inactif"
        fi
    else
        echo "❌ Monitoring: Inactif"
    fi
}

# Fonction pour afficher les logs
show_logs() {
    local lines=${1:-50}
    log "📋 Dernières $lines lignes des logs:"
    echo "=" | head -c 50 && echo ""
    
    if [ -f "$LOG_FILE" ]; then
        tail -n "$lines" "$LOG_FILE"
    else
        echo "❌ Aucun fichier de log trouvé"
    fi
}

# Fonction principale
main() {
    case "${1:-status}" in
        "start")
            start_monitoring
            ;;
        "stop")
            stop_monitoring
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-50}"
            ;;
        "restart")
            restart_app
            ;;
        *)
            echo "Usage: $0 {start|stop|status|logs|restart}"
            echo ""
            echo "Commandes:"
            echo "  start   - Démarrer le monitoring"
            echo "  stop    - Arrêter le monitoring"
            echo "  status  - Afficher le statut"
            echo "  logs    - Afficher les logs (optionnel: nombre de lignes)"
            echo "  restart - Redémarrer l'application"
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale
main "$@"


