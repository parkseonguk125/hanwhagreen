import { Link } from "react-router-dom";
import projectGalleryMeta from "../../data/projectGalleryMeta.json";
import { buildBoardUrl, scaMatches } from "../../utils/boardSca";

export default function ProjectCategoryNav({ table, activeSca = "" }) {
  return (
    <nav id="board_cate">
      <ul>
        {projectGalleryMeta.categories.map((category) => {
          const isActive = scaMatches(activeSca, category.sca);

          return (
            <li key={category.label}>
              <Link
                to={buildBoardUrl(table, { sca: category.sca })}
                id={isActive ? "bo_cate_on" : undefined}
              >
                {category.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { scaMatches };
