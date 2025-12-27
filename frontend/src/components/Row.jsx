export default function Row({
    code,
    name,
    reg,
    real,
    noshow,
    paid,
    debt
}) {
    return (
        <tr className="border-b last:border-none hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-700">
                {name || code}
            </td>

            <td className="px-4 py-3 text-center">
                {reg ?? "-"}
            </td>

            <td className="px-4 py-3 text-center">
                {real ?? "-"}
            </td>

            <td className="px-4 py-3 text-center text-red-500">
                {noshow ?? "-"}
            </td>

            <td className="px-4 py-3 text-center text-emerald-600">
                {paid ?? "-"}
            </td>

            <td className="px-4 py-3 text-center text-orange-500">
                {debt ?? "-"}
            </td>
        </tr>
    );
}
