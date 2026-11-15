// Mapa interativo (OpenStreetMap + Leaflet) dentro de uma WebView.
// Não precisa de chave de API do Google. Precisa de internet para carregar o mapa.
import React, { useMemo } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { colors, radius } from '../theme'

function buildHtml(places, position) {
  const center = position || places[0] || { latitude: -15.83, longitude: -47.98 }
  const markers = places.map((p) => ({ id: p.id, lat: p.latitude, lng: p.longitude, nome: p.nome, end: p.endereco || '' }))
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#m{height:100%;margin:0;font-family:sans-serif}
.pin{width:28px;height:28px;border-radius:50% 50% 50% 0;background:${colors.primary};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.me{width:16px;height:16px;border-radius:50%;background:#2F6FD6;border:3px solid #fff;box-shadow:0 0 0 2px #2F6FD6}
.pop b{display:block;margin-bottom:2px}.pop a{color:${colors.primary};font-weight:600;text-decoration:none}
#err{display:none;position:absolute;inset:0;align-items:center;justify-content:center;color:#5E7387;text-align:center;padding:20px}</style>
</head><body><div id="m"></div><div id="err">Não foi possível carregar o mapa. Verifique a internet ou use a lista.</div>
<script>
function send(m){ if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(m)} else if(window.parent){window.parent.postMessage({petcare:m},'*')} }
if(typeof L==='undefined'){document.getElementById('err').style.display='flex'} else {
var map=L.map('m',{zoomControl:false}).setView([${center.latitude},${center.longitude}],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
var pts=${JSON.stringify(markers)};var icon=L.divIcon({className:'',html:'<div class="pin"></div>',iconSize:[28,28],iconAnchor:[14,28],popupAnchor:[0,-26]});
var b=[];pts.forEach(function(p){var mk=L.marker([p.lat,p.lng],{icon:icon}).addTo(map);
mk.bindPopup('<div class="pop"><b>'+p.nome.replace(/</g,'&lt;')+'</b>'+p.end.replace(/</g,'&lt;')+'<br><a href="#" onclick="send(\\''+p.id+'\\');return false">Ver detalhes</a></div>');b.push([p.lat,p.lng])});
${position ? `L.marker([${position.latitude},${position.longitude}],{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16]})}).addTo(map);b.push([${position.latitude},${position.longitude}]);` : ''}
if(b.length>1){map.fitBounds(b,{padding:[30,30]})}}
</script></body></html>`
}

export default function PlacesMap({ places, position, onSelect, height = 420 }) {
  const html = useMemo(() => buildHtml(places, position), [places, position])
  const handle = (id) => {
    const p = places.find((x) => x.id === id)
    if (p) onSelect?.(p)
  }

  if (Platform.OS === 'web') {
    return <WebMap html={html} height={height} onMessage={handle} />
  }
  return (
    <View style={[styles.wrap, { height }]}>
      <WebView originWhitelist={['*']} source={{ html }} onMessage={(e) => handle(e.nativeEvent.data)} style={{ flex: 1 }} />
    </View>
  )
}

// No navegador a WebView não existe; usa um iframe
function WebMap({ html, height, onMessage }) {
  React.useEffect(() => {
    const fn = (e) => e?.data?.petcare && onMessage(e.data.petcare)
    window.addEventListener('message', fn)
    return () => window.removeEventListener('message', fn)
  }, [onMessage])
  return (
    <View style={[styles.wrap, { height }]}>
      {React.createElement('iframe', { srcDoc: html, style: { border: 0, width: '100%', height: '100%' }, title: 'Mapa' })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.border },
})
