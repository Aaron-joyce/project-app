using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dtos;

namespace backend.Services;

public interface IPersonService
{
    Task<IEnumerable<PersonResponseDto>> GetAllPersonsAsync();
    Task<PersonResponseDto> GetPersonByIdAsync(Guid id);
    Task<Guid> RegisterPersonAsync(PersonDto dto);
    Task UpdatePersonAsync(Guid id, PersonDto dto);
}
