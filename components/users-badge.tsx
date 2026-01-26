import {Avatar, AvatarFallback, AvatarGroup, AvatarImage} from "@/components/ui/avatar";
import { useGroups } from "@/hooks/useGroups";
import {useUserProfilById} from "@/hooks/useUserProfileById";
import {getInitials} from "@/lib/util";

export function UsersBadge() {
    const { groups } = useGroups();

    const memberIds = groups[0]?.member_ids ?? [];
    const { profiles } = useUserProfilById(memberIds);
    const MAX = 4;
    const visibleProfiles = profiles.slice(0, MAX);
    const remaining = profiles.length - MAX;

    return (
        <div>
            <AvatarGroup>
                {visibleProfiles.map(profile => (
                    <Avatar key={profile.id} title={profile.display_name ?? ""}>
                        <AvatarImage src={profile.avatar_url ?? undefined} />
                        <AvatarFallback>{getInitials(profile.display_name)}</AvatarFallback>
                    </Avatar>
                ))}

                {remaining > 0 && (
                    <Avatar>
                        <AvatarFallback>+{remaining}</AvatarFallback>
                    </Avatar>
                )}
            </AvatarGroup>
        </div>
    );
}
