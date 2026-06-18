import FindAdvisorsClient from "./FindAdvisorsClient";

export default function FindAdvisors({
  featuredAdvisors = [],
  allAdvisors = [],
  featuredIdList = [],
  isLoggedIn = false,
}) {
  return (
    <FindAdvisorsClient
      featuredAdvisors={featuredAdvisors}
      allAdvisors={allAdvisors}
      featuredIdList={featuredIdList}
      isLoggedIn={isLoggedIn}
    />
  );
}
