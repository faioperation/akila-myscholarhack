import { Rating } from "@smastrom/react-rating";
import Image from "next/image";
import "@smastrom/react-rating/style.css";

export default function ReviewCard({message, username, address, star, profileImage}) {
  return (
    <div className="w-auto  border border-[#EDEDED] rounded-2xl px-6 py-8 ">
      <Rating style={{ maxWidth: 120 }} value={star} readOnly />
      <p className="text-xl pt-6 pb-28 h-60">
        {message}
      </p>
      <div className="flex items-center gap-4">
        <div className="w-[60px] h-[60px] rounded-2xl">
          <Image
            className="w-full h-full object-cover rounded-2xl"
            src={profileImage}
            height={100}
            width={100}
            alt="user profile"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{username}</h3>
          <p className="text-base">{address}</p>
        </div>
      </div>
    </div>
  );
}
