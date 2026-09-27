// ~480 common English words, lowercase letters only.
const WORDS = `
the a an i you he she it we they me him her us them my your his its our
their this that these those who what which where when why how all some many
few other another any each every both either neither be have do say go get
make know think take see come want look use find give tell work call try ask
need feel become leave put mean keep let begin seem help talk turn start
show hear play run move like live believe hold bring happen write provide
sit stand lose pay meet include continue set learn change lead understand
watch follow stop create speak read allow add spend grow open walk win offer
remember love consider appear buy wait serve die send expect build stay fall
cut reach kill remain suggest raise pass sell require report decide pull
time person year way day man thing woman life child world school state
family student group country problem hand part place case week company
system program question government number night point home water room mother
area money story fact month lot right study book eye job word business issue
side kind head house service friend father power hour game line end member
law car city community name president team minute idea kid body information
back parent face others level office door health art war history party
result morning reason research girl guy moment air teacher force education
good new first last long great little own old big high different small large
next early young important public bad same able human local sure better best
low real free true whole major current left national possible late hard
recent available easy strong special clear red difficult certain economic
black white close main full common natural significant similar hot dead
central happy serious ready simple short personal single medical alone cold
popular basic traditional dark various entire past final future wrong
private social light safe physical general environmental financial blue
beautiful specific primary individual potential professional international
direct up so out just now then more also here well only very still even
there down after never always often almost again already soon directly once
quickly quite recently suddenly certainly usually exactly finally nearly
simply hardly later together likely especially immediately actually
sometimes yesterday tomorrow tonight away today far thus perhaps therefore
forward indeed enough rather less ahead anymore besides beyond clearly
elsewhere everywhere forever frequently however inside instead maybe
meanwhile mostly nearby occasionally otherwise outside rarely somewhere
twice whenever wherever yet to of in for on with at by from about into
through during before over between under since without within along
following across behind plus except but against around among throughout
despite towards upon off above below including until while via per toward
and or if because as although though unless whether nor whereas than
whatever whoever
`
  .trim()
  .split(/\s+/);

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

/** Random words with no immediate repeats. */
export function randomWords(count: number): string[] {
  const out: string[] = [];
  while (out.length < count) {
    const word = randomWord();
    if (word !== out[out.length - 1]) out.push(word);
  }
  return out;
}
