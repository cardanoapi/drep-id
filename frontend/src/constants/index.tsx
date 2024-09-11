import ConnectWallet from "@src/assets/images/how-it-works/connectWallet.png";
import MintDRep from "@src/assets/images/how-it-works/mintDRep.png";
import ManageProfile from "@src/assets/images/how-it-works/manageProfile.png";
import UniqueDRepIcon from "@src/components/icons/uniqueDRep";
import DelegateVoteIcon from "@src/components/icons/delegateVote";
import SocialShareIcon from "@src/components/icons/socialShare";
export const banner = {
  title: "Create, Manage, and Share Your Unique DRep ID",
  description:
    "Streamline your digital identity with a URL-friendly DRep ID. Easily mint and share your unique identifier with simplicity.",
};

export const howItWorks = {
  title: "How It Works",
  description: "Connecting Your Wallet and Minting a DRep ID",
  steps: [
    {
      id: 1,
      title: "Connect Your Wallet",
      description:
        "Connect your preferred blockchain wallet to the DRep platform. This securely links your account to your identity.",
      icon: ConnectWallet,
    },
    {
      id: 2,
      title: "Mint Your DRep ID",
      description:
        "Choose a unique, URL-friendly DRep ID. It's like a username on the blockchain, making your DRep ID easy to share.",
      icon: MintDRep,
    },
    {
      id: 3,
      title: "Manage Your Profile",
      description:
        "Your personalized DRep profile page is created. It displays your chosen DRep ID, delegate button, and other crucial information.",
      icon: ManageProfile,
    },
  ],
};

export const features = {
  title: "Our Features",
  description: "Simplifying and enhancing your DRep ID",
  steps: [
    {
      id: 1,
      title: "Unique DRep IDs",
      description: "Simplify communication with easy-to-share IDs.",
      icon: UniqueDRepIcon,
    },
    {
      id: 2,
      title: "Delegate your vote",
      description: "Easily manage your voting with a single click.",
      icon: DelegateVoteIcon,
    },
    {
      id: 3,
      title: "Social Sharing",
      description: "Rich previews for sharing your profile on social media.",
      icon: SocialShareIcon,
    },
  ],
};
