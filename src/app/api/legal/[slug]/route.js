import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LegalContent from '@/models/LegalContent';

const DEFAULT_CONTENT = {
  betingelser: {
    title: 'Betingelser',
    content: '<h2>Betingelser for bruk</h2><p>Velkommen til Nepalvibb. Ved å bruke våre tjenester godtar du disse vilkårene.</p><h3>Bestillinger</h3><p>Alle bestillinger er bindende og bekreftes med nedbetaling.</p><h3>Avbestilling</h3><p>Se våre avbestillingsregler for refusjon ved avbestilling.</p><h3>Ansvarsfraskrivelse</h3><p>Nepalvibb er ikke ansvarlig for forsinkelser eller hendelser utenfor vår kontroll.</p>',
  },
  personvern: {
    title: 'Personvern',
    content: '<h2>Personvernpolicy</h2><p>Vi respekterer ditt personvern og beskytter dine personopplysninger.</p><h3>Hvilke data vi samler inn</h3><p>Vi samler inn navn, e-post og kontaktinformasjon for å behandle bestillinger.</p><h3>Hvordan vi bruker dataene</h3><p>Dine data brukes kun for å gjennomføre dine bestillinger og forbedre våre tjenester.</p><h3>Dine rettigheter</h3><p>Du kan når som helst be om innsyn, retting eller sletting av dine data.</p>',
  },
};

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const { slug } = await params;
    let doc = await LegalContent.findOne({ slug });
    if (!doc && DEFAULT_CONTENT[slug]) {
      doc = await LegalContent.create({ slug, ...DEFAULT_CONTENT[slug] });
    }
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
