import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Locations from '../components/Locations';
import Reserve from '../components/Reserve';
import Backdrop from '../components/Backdrop';

const photo = { src: '/assets/gallery/places/backdrop.webp', small: '/assets/gallery/places/backdrop-sm.webp', position: '30% 50%' };

/* Overview: one box per place, each opening its own page */
export default function Places() {
  return (
    <>
      <Backdrop photo={photo} />
      <Page className="page--backdrop">
        <PageHeader
          tall
          eyebrow="Our Places"
          lines={['Three addresses.', <em>One welcome.</em>]}
          intro="From the cool of the Palani Hills to the heart of the temple city — choose the stay that suits your journey."
        />
        <Locations showHead={false} />
        <Reserve />
      </Page>
    </>
  );
}
