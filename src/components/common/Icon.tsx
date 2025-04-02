import { Domain } from "types/domain";
import { toRoman } from "utils";

interface IconProps {
    domain: Domain;
    border: boolean | undefined;
}

export const Icon = ({ domain, border = false }: IconProps) => {
    const match = domain.id.match(/\d+$/);
    const number = match ? parseInt(match[0], 10) : NaN;
    const romanNumeral = toRoman(number);

    return (
        <span
            className={`inline-flex items-center justify-center w-6 h-6 mr-2 font-bold ${
                border ? "border rounded-full text-xs" : "text-lg"
            }`}
            style={{ borderColor: domain.colorCode, color: domain.colorCode }}
        >
            {romanNumeral}
        </span>
    );
};