import Page from '../components/Page';
import PageHeader from '../components/PageHeader';
import Locations from '../components/Locations';
import Reserve from '../components/Reserve';

/* Overview: one box per place, each opening its own page */
export default function Places() {
  return (
    <Page>
      <PageHeader
        eyebrow="Our Places"
        lines={['Three addresses.', <em>One welcome.</em>]}
        intro="From the cool of the Palani Hills to the heart of the temple city — choose the stay that suits your journey."
      />
      <Locations showHead={false} />
      <Reserve />
    </Page>
  );
}
