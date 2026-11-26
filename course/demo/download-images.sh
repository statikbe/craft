#!/bin/bash
# Downloads the demo photos (Unsplash, found with searches on unsplash.com) and makes the generated files.
# Run from anywhere: bash course/demo/download-images.sh
set -e
D="$(cd "$(dirname "$0")" && pwd)"
IMG="$D/images"; UP="$D/upload"
mkdir -p "$IMG" "$UP/routefotos"
u() { echo "https://images.unsplash.com/photo-$1?w=${3:-2400}&q=80&fm=jpg"; }
get() { # id file [width]
  [ -s "$2" ] && return 0
  curl -sfL -o "$2" "$(u $1 x ${3:-2400})"
}
# Assets imported into Craft (images/)
get 1769766160555-18bb489f4c0f "$IMG/IMG_4031.jpg"            # misty heath at sunrise
get 1630912008613-5ebdd5d8179c "$IMG/heideroute.jpg"          # heather in bloom along a sandy path
get 1630912008613-5ebdd5d8179c "$IMG/heide-delen.jpg" 2000
get 1762079237876-53f87cb9048a "$IMG/heidelandschap.jpg"      # brown heathland, forest on the horizon
get 1695755594813-14e57fab9a56 "$IMG/heide-close-up.jpg"      # close-up of heather flowers
get 1723395439327-67915dd629ab "$IMG/heide-staand.jpg"        # portrait: heather field
get 1461870083782-4d7b4f364728 "$IMG/wandelaars.jpg"          # group walking in an autumn forest
get 1758599668796-cdd37f4ecb66 "$IMG/wandeldag-1.jpg" 1800
get 1627545987039-1a9ab41214d8 "$IMG/wandeldag-2.jpg" 1800
get 1759917839348-30e4c570c1bd "$IMG/wandeldag-3.jpg" 1800
get 1770563182273-e9030a5f24df "$IMG/wandeldag-4.jpg" 1800
get 1758599668542-53e8c63c8e68 "$IMG/wandeldag-5.jpg" 1800
get 1758599669009-5a9002c09487 "$IMG/wandeldag-6.jpg" 1800
get 1730841623837-68c427076642 "$IMG/bospad.jpg"              # landscape forest path
get 1761766885364-9aa79b2f41fd "$IMG/dijle-pad.jpg"           # boardwalk through reeds
get 1648073012229-9eade8843618 "$IMG/ochtendwandeling.jpg"    # misty morning forest path with a walker
get 1755939219287-802e29478e68 "$IMG/beekroute.jpg"           # boardwalk in a forest
get 1762165864778-7c370f6020e7 "$IMG/bosroute.jpg"            # boardwalk through dry grass towards trees
get 1557876792-b1a8992cde57 "$IMG/vijver-lus.jpg"             # person at a lake
get 1786611547868-36fd1aa50fc8 "$IMG/kempen.jpg"              # trees above morning mist in a heathland
get 1694125400089-e9db301ea643 "$IMG/ardennen.jpg"            # lake surrounded by trees
# Team portraits (fictional names): seen from behind or the side, no recognisable faces
get 1793662987471-6b49b4f38eff "$IMG/team-femke.jpg" 1400    # woman with a blonde bun, from behind, looking at pines
get 1773394887111-e36e9c130d71 "$IMG/team-joris.jpg" 1400    # man in a green shirt and cap, from behind, in the forest
get 1606486268403-3f41efff023f "$IMG/team-ilse.jpg" 1400     # woman with a backpack, from behind, in the forest
get 1779632896039-dce5cb163eb1 "$IMG/team-stijn.jpg" 1400    # man in a beanie among pine trees, from behind
# Site pages (Algemeen/): home hero, Over ons, legal pages, 404, overviews (searches: heathland, forest boardwalk, ...)
get 1603102841906-dc1ab12e8b12 "$IMG/heide-wandelaars.jpg"   # three walkers on a heathland path, from behind
get 1737879551026-c15ee30d40e1 "$IMG/heidepad.jpg"           # a walker on a sandy path through the heath
get 1735920777178-4a5fb3c0d29b "$IMG/bosweg-wandelaar.jpg"   # a man walking a sunny forest road, from behind
get 1771861034458-2ccee18b902d "$IMG/wegwijzer.jpg"          # wooden signpost in the forest
get 1758599667717-27c61bcdd14b "$IMG/vrijwilligers.jpg"      # volunteers with rubbish bags in a forest
get 1598454635086-ea753e0641fe "$IMG/vlonder-bos.jpg"        # wooden boardwalk between green trees
get 1772532296881-222bcb160894 "$IMG/riet.jpg"               # reeds reflected in still water at sunrise
get 1754940494189-1811e3dc3a5b "$IMG/heide-bloei.jpg"        # close-up of flowering heather
get 1553984840-b8cbc34f5215 "$IMG/gouden-bos.jpg"            # forest path in golden light
get 1734822309193-18d7172ee4d5 "$IMG/mistig-bos.jpg"         # pine forest in the fog
get 1536625979259-edbae645c7c3 "$IMG/bospad-zon.jpg"         # small walker on a sunlit forest path
get 1645374158583-90ef17f789ee "$IMG/boshyacinten.jpg"       # bluebells in a spring forest
get 1760967053298-9f9888a3ac36 "$IMG/rijp.jpg"               # frost on the grass in a forest clearing
# News and events, loose in the root folder (video 5.1 sorts them into folders)
get 1700656106838-5a7d917d2678 "$IMG/herfstbos.jpg"          # forest path in autumn colours
get 1759709818193-5a3c8306e78a "$IMG/groepswandeling.jpg"    # group of walkers on a path full of autumn leaves
get 1606474226448-4aa808468efc "$IMG/gezin-in-het-bos.jpg"   # parent and children on a forest path
get 1759070696368-ae7ebc594e40 "$IMG/paaltje.jpg"            # wooden post with a trail marker
get 1758599667729-a6f0f8bd213b "$IMG/opruimactie.jpg"        # volunteers cleaning up a forest
get 1759307532280-35b9bf8f2f37 "$IMG/vogels-zonsopgang.jpg"  # birds flying over reeds at sunrise
get 1645563908390-d21623d0e1fd "$IMG/zwanen.jpg"             # swans in a pond
get 1770064027807-ab81ae80fcfa "$IMG/winterbos.jpg"          # snowy path through a beech forest
get 1645013283313-944128f03045 "$IMG/kaart-en-kompas.jpg"    # hand holding a map and compass in the forest
get 1785412723173-8b3ef1a99d75 "$IMG/hond-op-de-heide.jpg"   # walker and dog on a path across the heath
get 1762380137576-1c696108f6e9 "$IMG/verrekijker.jpg"        # woman with binoculars at dusk, side view
get 1670172071912-ba4bca6be800 "$IMG/uitzicht-bos.jpg"       # hiker overlooking wooded hills, from behind
get 1774381614646-cf80a17468fb "$IMG/moeras-vlonder.jpg"     # boardwalk through a marsh at sunset
# gids-aan-de-vijver.jpg: man at a lake, cropped so he stands at the far left
if [ ! -s "$IMG/gids-aan-de-vijver.jpg" ]; then
  curl -sfL -o /tmp/gv.jpg "$(u 1587443559451-e4000c1dfdbd x 2400)"
  magick /tmp/gv.jpg -crop 1800x1200+600+500 +repage "$IMG/gids-aan-de-vijver.jpg"
fi
# vlonder.jpg: boardwalk through tall grass, turned on its side (for the rotate demo)
if [ ! -s "$IMG/vlonder.jpg" ]; then
  curl -sfL -o /tmp/vl.jpg "$(u 1758565204882-e7768cac06c4 x 2400)"
  magick /tmp/vl.jpg -rotate -90 "$IMG/vlonder.jpg"
fi
# Generated: route map (PNG), PDFs, partner logos
if [ ! -s "$IMG/kaart-heideroute.png" ]; then
  magick -size 1600x1100 xc:'#f3efe2' \
    -fill '#d9c7e6' -draw "ellipse 700,560 520,360 0,360" \
    -fill '#bfe0f0' -stroke '#7fb2c9' -strokewidth 4 -draw "ellipse 1100,420 150,95 0,360" \
    -fill '#b9d6a8' -stroke none -draw "ellipse 380,820 260,170 0,360" \
    -fill none -stroke '#c0392b' -strokewidth 12 -draw "path 'M 300,560 C 320,250 900,170 1060,330 C 1220,500 1200,760 900,880 C 650,980 330,900 300,560 Z'" \
    -fill '#c0392b' -stroke white -strokewidth 5 -draw "circle 300,560 330,560" \
    -stroke none -fill '#333' -pointsize 40 -annotate +120,500 'Start: bezoekerscentrum' \
    -annotate +1000,560 'Vijver' -annotate +300,960 'Bos' -annotate +620,380 'Heide' \
    -pointsize 56 -annotate +60,90 'Heideroute - 8 km' "$IMG/kaart-heideroute.png"
fi
[ -s "$IMG/wandelkaart-heideroute.pdf" ] || magick "$IMG/kaart-heideroute.png" -quality 92 "$IMG/wandelkaart-heideroute.pdf"
if [ ! -s "$IMG/routekaart-beekvallei.pdf" ]; then
  magick -size 1600x1100 xc:'#eef4ea' -fill none -stroke '#2e86c1' -strokewidth 14 \
    -draw "path 'M 100,900 C 400,700 600,950 900,600 S 1400,300 1500,150'" \
    -stroke '#7d5a3c' -strokewidth 8 -draw "path 'M 160,980 C 420,760 640,1020 940,680 S 1440,380 1520,240'" \
    -stroke none -fill '#333' -pointsize 56 -annotate +60,90 'Routekaart Beekvallei - 6 km' "$IMG/routekaart-beekvallei.pdf"
fi
logo() { [ -s "$IMG/$1" ] || magick -size 800x400 xc:white -fill "$2" -draw "circle 170,200 170,90" -fill white -pointsize 110 -gravity West -annotate +118+0 "$3" -fill '#222' -pointsize 64 -annotate +320-40 "$4" -fill '#666' -pointsize 40 -annotate +322+40 "$5" "$IMG/$1"; }
logo logo-heidevrienden.png '#7b4f9d' 'H' 'Heidevrienden' 'vrijwilligers'
logo logo-bezoekerscentrum-de-ven.png '#2e86c1' 'V' 'De Ven' 'bezoekerscentrum'
logo logo-bakkerij-het-graan.png '#c98a2b' 'G' 'Het Graan' 'bakkerij'
# Files for uploading during the takes (upload/), not imported
get 1630912008613-5ebdd5d8179c "$UP/heide.jpg" 2400
get 1557876792-b1a8992cde57 "$UP/vijver.jpg" 2400
[ -s "$UP/wandelkaart-heideroute.pdf" ] || cp "$IMG/wandelkaart-heideroute.pdf" "$UP/"
[ -s "$UP/heide-groot.jpg" ] || magick "$(curl -sfL -o /tmp/hg.jpg "$(u 1762079237876-53f87cb9048a x 6000)" && echo /tmp/hg.jpg)" -resize '6000x4000^' -gravity center -extent 6000x4000 "$UP/heide-groot.jpg"
get 1762079237876-53f87cb9048a "$UP/heide-klein.jpg" 400
n=0; for id in 1755939219287-802e29478e68 1758565204882-e7768cac06c4 1761766885364-9aa79b2f41fd 1762165864778-7c370f6020e7 1730841623837-68c427076642 1728381655658-b89d1ca11092; do n=$((n+1)); get $id "$UP/routefotos/route-$n.jpg" 2400; done
echo done
